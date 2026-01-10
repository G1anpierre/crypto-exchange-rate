/**
 * LangChain to UI Stream Converter
 *
 * Bridges LangChain's streaming format to Vercel AI SDK's UIMessageChunk format.
 *
 * Learning Goals:
 * - Understand stream format conversion
 * - See how to make LangChain work with useChat() hook
 * - Learn about AI SDK Data Stream Protocol
 */

import {UIMessageChunk} from 'ai'
import {randomUUID} from 'crypto'

/**
 * Convert LangChain agent stream to UIMessageChunk format
 *
 * WHY THIS IS NEEDED:
 * - LangChain: Returns AsyncIterator<[token, metadata]> tuples
 * - AI SDK useChat(): Expects ReadableStream<UIMessageChunk> with SSE format
 * - This function is the "bridge" that makes them compatible
 *
 * ALTERNATIVE APPROACHES:
 * 1. Build custom frontend hook (200+ lines, reinvent the wheel)
 * 2. Use LangChain's built-in React hooks (less mature than Vercel AI SDK)
 * 3. This bridge (30 lines, keeps useChat() DX, unlocks LangChain features) ✅
 *
 * @param stream - LangChain agent stream from agent.stream()
 * @returns ReadableStream<UIMessageChunk> compatible with useChat()
 */
export function convertLangChainStreamToUI(
  stream: AsyncIterable<any>,
): ReadableStream<UIMessageChunk> {
  const textId = randomUUID() // Unique ID for this text part

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      try {
        // Signal start of text streaming
        // This tells useChat() a new message is beginning
        controller.enqueue({
          type: 'text-start',
          id: textId,
        })

        let chunkCount = 0

        // Stream text deltas from ReactAgent
        // streamMode: "messages" returns [token, metadata] tuples
        for await (const chunk of stream) {
          chunkCount++

          // streamMode: "messages" returns [token, metadata]
          // - token: Contains the actual LLM output (text content)
          // - metadata: Contains LangGraph node info (agent, tools, model)
          let textContent = ''

          // Check if it's a tuple [token, metadata]
          if (Array.isArray(chunk) && chunk.length === 2) {
            const [token, metadata] = chunk
            const nodeName = metadata?.langgraph_node || 'unknown'

            console.log(`📨 Chunk ${chunkCount} from node: ${nodeName}`, {
              tokenType: token?.constructor?.name,
              hasContent: !!token?.content,
              contentPreview:
                typeof token?.content === 'string'
                  ? token.content.substring(0, 100)
                  : 'N/A',
            })

            // FILTER: Only stream content from the 'agent' or 'model' node
            // Skip 'tools' node (this contains raw tool JSON output, not for users)
            if (nodeName === 'tools') {
              console.log(`⏭️  Skipping tool output (not for user display)`)
              continue // Skip this chunk
            }

            // Extract text from token
            if (token && typeof token.content === 'string') {
              textContent = token.content
            } else if (token?.contentBlocks) {
              // Some tokens have contentBlocks array
              textContent = token.contentBlocks
                .filter((block: any) => block.type === 'text')
                .map((block: any) => block.text)
                .join('')
            }
          } else if (chunk?.content && typeof chunk.content === 'string') {
            // Fallback: direct content string
            textContent = chunk.content
          }

          // Send text delta to the UI
          if (textContent) {
            console.log(
              `📝 Streaming to UI: ${textContent.substring(0, 50)}...`,
            )

            controller.enqueue({
              type: 'text-delta',
              delta: textContent,
              id: textId,
            })
          }
        }

        console.log(`✅ Stream complete. Total state updates: ${chunkCount}`)

        // Signal end of text streaming
        // This tells useChat() the message is complete
        controller.enqueue({
          type: 'text-end',
          id: textId,
        })

        controller.close()
      } catch (error) {
        console.error('❌ Stream error:', error)
        controller.error(error)
      }
    },
  })
}

/**
 * LEARNING NOTES:
 *
 * 1. AI SDK DATA STREAM PROTOCOL:
 * The useChat() hook expects a specific format:
 *
 * text-start → Begins a new message
 *   { type: 'text-start', id: 'uuid' }
 *
 * text-delta → Incremental text chunks (streaming!)
 *   { type: 'text-delta', delta: 'Hello', id: 'uuid' }
 *   { type: 'text-delta', delta: ' world', id: 'uuid' }
 *
 * text-end → Message complete
 *   { type: 'text-end', id: 'uuid' }
 *
 * This creates the smooth typewriter effect in the UI!
 *
 * 2. LANGCHAIN STREAM MODES:
 * When calling agent.stream(), you can specify different modes:
 *
 * - "values": Full state snapshots (entire conversation state each time)
 * - "updates": Agent step updates (reasoning, tool calls, responses)
 * - "messages": LLM token stream (what we use for UI streaming!) ✅
 *
 * We use "messages" mode because it gives us real-time tokens as they're generated.
 *
 * 3. NODE FILTERING:
 * LangGraph agents have multiple nodes:
 * - 'agent': Initial reasoning and planning
 * - 'tools': Tool execution (raw JSON results)
 * - 'model': LLM generation (the text we want!)
 *
 * We SKIP 'tools' node because it contains JSON like:
 *   {"binance": 45000, "coinbase": 45100}
 *
 * We STREAM 'model' and 'agent' nodes because they contain user-friendly text:
 *   "Bitcoin is trading at $45,000..."
 *
 * 4. WHY READABLESTREAM?
 * - Browser-native API for streaming data
 * - Works with Response objects (SSE - Server-Sent Events)
 * - Compatible with AI SDK's createUIMessageStreamResponse()
 * - Can be consumed by useChat() hook on the frontend
 *
 * 5. ERROR HANDLING:
 * If streaming fails:
 * - controller.error(error) notifies the client
 * - Frontend can show error message to user
 * - Better UX than silent failures
 *
 * 6. CHUNK COUNTING:
 * We log chunkCount to help debug:
 * - Too few chunks: Model might not be streaming properly
 * - Too many chunks: Might indicate unnecessary state updates
 * - Useful for optimizing performance
 *
 * 7. CONTENT EXTRACTION FALLBACKS:
 * We try multiple ways to extract text:
 * 1. token.content (string) - Most common
 * 2. token.contentBlocks[] - Some models use this
 * 3. chunk.content - Direct fallback
 *
 * This makes our converter robust across different LLM providers.
 *
 * 8. THE POWER OF THIS BRIDGE:
 * With just 30 lines, we get:
 * ✅ LangChain's enterprise features (agents, tools, memory)
 * ✅ Vercel AI SDK's great UX (useChat hook, streaming)
 * ✅ Best of both worlds!
 *
 * Without this bridge, you'd need to:
 * - Build custom React hooks
 * - Implement SSE parsing
 * - Handle loading states
 * - Manage error states
 * - Deal with message ordering
 * = 200+ lines of complex code!
 */
