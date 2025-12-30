/**
 * LangChain Chat API Route - V2: ReactAgent with Tools
 *
 * Learning Goals:
 * 1. Understand ReactAgent (Reasoning + Acting) pattern
 * 2. See how agents decide when to use tools
 * 3. Compare LangChain tools vs Vercel AI SDK tools
 * 4. Learn agent streaming with state updates
 *
 * What this HAS:
 * - ✅ ReactAgent with tool calling capability
 * - ✅ getExchangeRate tool (real-time crypto prices)
 * - ✅ Agent decision-making (tool vs direct response)
 * - ✅ Streaming with UIMessageChunk conversion
 *
 * What this does NOT have (yet):
 * - ❌ No memory (we'll add BufferWindowMemory next)
 * - ❌ No modular structure (everything inline for learning)
 *
 * This is a ReAct agent chatbot with tools!
 */

import { ChatGroq } from '@langchain/groq'
import { createUIMessageStreamResponse, UIMessageChunk } from 'ai'
import { randomUUID } from 'crypto'
import { createAgent, createMiddleware } from 'langchain'
import { MemorySaver, REMOVE_ALL_MESSAGES } from '@langchain/langgraph'
import { RemoveMessage } from '@langchain/core/messages'
import { auth } from '@/auth'
import {
  getExchangeRateTool,
  getNewsTool,
  compareCoinsTool,
} from '@/lib/langchain/tools'

// Allow streaming responses up to 30 seconds (same as Vercel AI SDK endpoint)
export const maxDuration = 30

// Configuration: Maximum number of messages to keep in conversation history
// This prevents context window overflow and keeps conversations focused
const MESSAGE_LIMIT = 5 // Keep last 5 messages (2-3 conversation turns)

/**
 * Extract text content from AI SDK v6 message format
 * Handles both simple string content and parts array format
 */
function extractMessageContent(message: any): string {
  if (typeof message.content === 'string') {
    return message.content
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join(' ')
  }

  return String(message.content || '')
}

/**
 * Middleware to trim conversation history
 * Keeps only the last MESSAGE_LIMIT messages to prevent context overflow
 */
const trimMessagesMiddleware = createMiddleware({
  name: 'TrimMessages',
  beforeModel: (state) => {
    const messages = state.messages

    // If we're within limit, don't trim
    if (messages.length <= MESSAGE_LIMIT) {
      console.log(`📊 Message count: ${messages.length} (within limit of ${MESSAGE_LIMIT})`)
      return // No changes needed
    }

    console.log(`✂️  Trimming messages: ${messages.length} → ${MESSAGE_LIMIT}`)

    // Keep the last MESSAGE_LIMIT messages
    const recentMessages = messages.slice(-MESSAGE_LIMIT)

    // Return new state with trimmed messages
    return {
      messages: [new RemoveMessage({ id: REMOVE_ALL_MESSAGES }), ...recentMessages],
    }
  },
})

/**
 * POST /api/chat-langchain
 *
 * Request body:
 * {
 *   "messages": [
 *     { "role": "user", "content": "Hello!" }
 *   ]
 * }
 */
export async function POST(req: Request) {
  try {
    // 1. Get user session for thread ID (production-ready approach)
    const session = await auth()

    // Generate thread_id: user ID > session header > anonymous
    // This ensures each user has their own conversation thread
    const threadId =
      session?.user?.id || // Authenticated user
      req.headers.get('x-session-id') || // Custom session ID from client
      'anonymous' // Fallback for unauthenticated users

    console.log('🔑 Thread ID:', {
      threadId,
      isAuthenticated: !!session?.user,
      userId: session?.user?.id || 'none',
      userName: session?.user?.name || 'anonymous',
    })

    // 2. Parse the incoming request
    const body = await req.json()
    const messages = body.messages || []

    // 3. Convert ALL messages from AI SDK format to LangChain format
    // This enables conversation memory - the agent can see previous exchanges
    const conversationMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'human' : 'ai',
      content: extractMessageContent(msg),
    }))

    console.log('💬 Conversation history:', {
      totalMessages: conversationMessages.length,
      roles: conversationMessages.map((m: any) => m.role),
      preview: conversationMessages.map((m: any) => m.content.substring(0, 50) + '...'),
    })

    // Log the last message for debugging
    const lastMessage = conversationMessages[conversationMessages.length - 1]
    console.log('📨 Latest message:', {
      role: lastMessage?.role,
      content: lastMessage?.content,
    })

    // 2. Initialize the LLM (Language Model)
    //
    // KEY DIFFERENCE from Vercel AI SDK:
    // - Vercel AI SDK: Uses openrouter() provider
    // - LangChain: Uses ChatOpenAI with custom baseURL
    //
    // Why ChatOpenAI for OpenRouter?
    // - OpenRouter implements OpenAI's API specification
    // - So we can use the OpenAI adapter with a different baseURL
    // - Gets us all OpenAI features (streaming, function calling, etc.)
    // ChatOpenAI configuration for OpenRouter:
    // - modelName: The specific model to use
    // - configuration: ClientOptions with apiKey and baseURL for custom providers
    //
    // IMPORTANT: Model must support tool calling!
    //
    // GROQ MODELS (Free tier: 30 req/min, excellent for development):
    // - ✅ llama-3.3-70b-versatile (supports tools, fast, 128k context)
    // - ✅ llama-3.1-70b-versatile (supports tools, fast)
    // - ✅ mixtral-8x7b-32768 (supports tools)
    //
    // OPENROUTER FREE MODELS (50 req/day limit):
    // - ✅ google/gemini-2.0-flash-exp:free (supports tools, but rate limited)
    // - ❌ meta-llama/llama-3.3-70b-instruct:free (does NOT support tools)
    //
    // Using Groq for better rate limits and reliable tool calling!
    const llm = new ChatGroq({
      // Groq model - MUST support tool calling!
      // Note: ChatGroq uses 'model' not 'modelName'
      model: 'llama-3.3-70b-versatile',

      // Temperature: 0.7 = balanced (0 = deterministic, 1 = creative)
      temperature: 0.7,

      // API Key from environment variable
      apiKey: process.env.GROQ_API_KEY!,
    })

    console.log('🤖 LLM initialized:', {
      model: 'llama-3.3-70b-versatile',
      streaming: true,
      provider: 'Groq',
      hasApiKey: !!process.env.GROQ_API_KEY,
      supportsToolCalling: true,
    })

    // 3. Define tools for the agent
    //
    // KEY CONCEPT: Tools
    // Tools give the agent capabilities to interact with external systems
    // Now we have 3 tools:
    // 1. getExchangeRateTool - Real-time crypto prices from multiple exchanges
    // 2. getNewsTool - Latest cryptocurrency news from RSS feeds
    // 3. compareCoinsTool - Side-by-side comparison of multiple cryptocurrencies
    const tools = [getExchangeRateTool, getNewsTool, compareCoinsTool]

    console.log('🛠️  Tools loaded:', tools.map(t => t.name))

    // 4. Create ReactAgent with tools, memory, and middleware
    //
    // KEY CONCEPT: ReactAgent (Reasoning + Acting) with Memory
    // The agent uses the ReAct pattern to:
    // 1. THINK: Analyze user's question (with conversation context!)
    // 2. ACT: Decide if it needs to call a tool
    // 3. OBSERVE: Read tool results
    // 4. THINK: Formulate response based on observations
    // 5. RESPOND: Answer the user
    //
    // NEW: Checkpointer + Middleware
    // - MemorySaver: Stores conversation state (in-memory)
    // - trimMessagesMiddleware: Automatically keeps last 5 messages
    const checkpointer = new MemorySaver()

    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt: `You are a helpful AI assistant for CryptoCurrent, a cryptocurrency exchange platform.

Your role is to:
- Help users understand cryptocurrency exchange rates and pricing
- Provide real-time cryptocurrency news and market updates
- Compare multiple cryptocurrencies side-by-side
- Show price comparisons from multiple exchanges (Binance, Coinbase, Kraken)
- Detect and explain arbitrage opportunities (price differences between exchanges)
- Explain cryptocurrency concepts, blockchain, wallets, and trading
- NEVER provide financial advice or investment recommendations
- Always emphasize that crypto investments carry risks

CONVERSATION MEMORY:
- You have access to the full conversation history
- Reference previous questions and answers when relevant
- If a user asks "What about X?" understand the context from previous messages
- If comparing multiple items, remember what was discussed earlier

IMPORTANT TOOL USAGE INSTRUCTIONS:

1. **get_exchange_rate** - Use when users ask about a SINGLE cryptocurrency price:
   - Example: "What's the Bitcoin price?" or "How much is ETH?"
   - Always show prices from ALL exchanges returned in the tool result
   - Highlight which exchange has the best (lowest) price
   - If there's an arbitrage opportunity (>0.1% difference), mention it explicitly
   - Explain that USDT is Tether, a stablecoin pegged 1:1 to USD

2. **get_news** - Use when users ask about crypto news or current events:
   - Example: "What's the latest crypto news?" or "Any Bitcoin news?"
   - Can fetch from all sources or specific sources (bitcoinist, cointelegraph, decrypt, bscnews)
   - **PARAMETER LIMITS**: limit must be between 1-20 (default: 5)
   - **IMPORTANT**: If user requests more than 20 articles:
     * Call the tool with limit=20 (maximum allowed)
     * In your response, explain you're showing the maximum of 20 articles
     * Example: "Here are the latest 20 crypto news articles (showing maximum, you requested 100):"
   - Never pass limit > 20 or the tool call will fail with an error
   - Summarize the key headlines and provide context
   - Include links so users can read more

3. **compare_coins** - Use when users ask to compare MULTIPLE cryptocurrencies:
   - Example: "Compare Bitcoin and Ethereum" or "Which is better: SOL, ADA, or XRP?"
   - Requires 2-10 coins for comparison
   - Highlight the best/worst performers, cheapest/most expensive
   - Provide insights on 24h price changes and volumes

MULTI-TOOL ORCHESTRATION:
- You can use multiple tools in one response! Examples:
  - "Bitcoin price and latest news" → Use BOTH get_exchange_rate AND get_news
  - "Compare BTC and ETH, and show me crypto news" → Use compare_coins AND get_news
- Think about what information the user needs and use the appropriate tools

For general knowledge questions (like "What is blockchain?"), answer directly without using tools.

Be conversational, friendly, and informative. Use emojis sparingly. Keep responses concise but thorough.`,
      middleware: [trimMessagesMiddleware],
      checkpointer,
    })

    console.log('🧠 Agent created with memory:', {
      hasCheckpointer: true,
      hasMiddleware: true,
      messageLimit: MESSAGE_LIMIT,
    })

    // 5. Stream the agent execution with conversation history
    //
    // KEY DIFFERENCE from simple chain:
    // - Simple chain: prompt.pipe(llm).stream()
    // - ReactAgent with Memory: agent.stream() with FULL message history
    //
    // Stream Modes:
    // - "values": Full state snapshots (entire conversation state)
    // - "updates": Agent step updates (reasoning, tool calls)
    // - "messages": LLM token stream (what we want for UI streaming!)
    //
    // The agent's stream includes:
    // - Agent thinking/reasoning (with conversation context!)
    // - Tool calls
    // - Tool results
    // - Final response
    const stream = await agent.stream(
      {
        messages: conversationMessages, // Pass full conversation history!
      },
      {
        streamMode: 'messages', // Stream LLM tokens in real-time
        configurable: {
          thread_id: threadId, // Required for checkpointer to save state
        },
      }
    )

    console.log('🌊 Starting stream with conversation history...', {
      threadId,
      messageCount: conversationMessages.length,
    })

    // 6. Convert LangChain stream to UIMessageChunk format
    //
    // AI SDK v6 Data Stream Protocol:
    // - useChat() hook expects structured chunks (text-start, text-delta, text-end)
    // - We convert LangChain's async iterator to UIMessageChunk format
    // - createUIMessageStreamResponse converts to SSE (Server-Sent Events)
    //
    // This is the "bridge" between LangChain and Vercel AI SDK!

    const textId = randomUUID() // Unique ID for this text part

    // Convert LangChain stream to UIMessageChunk stream
    const messageChunks = new ReadableStream<UIMessageChunk>({
      async start(controller) {
        // Signal start of text streaming
        controller.enqueue({
          type: 'text-start',
          id: textId,
        })

        // Stream text deltas from ReactAgent
        // streamMode: "messages" returns [token, metadata] tuples
        // where token contains the actual LLM output chunks
        let chunkCount = 0

        try {
          for await (const chunk of stream) {
            chunkCount++

            // Cast chunk to any to inspect structure
            const chunkAny = chunk as any

            // streamMode: "messages" returns [token, metadata]
            // token has content/contentBlocks, metadata has langgraph_node
            let textContent = ''

            // Check if it's a tuple [token, metadata]
            if (Array.isArray(chunk) && chunk.length === 2) {
              const [token, metadata] = chunk
              const nodeName = metadata?.langgraph_node || 'unknown'

              console.log(`📨 Chunk ${chunkCount} from node: ${nodeName}`, {
                tokenType: token?.constructor?.name,
                hasContent: !!token?.content,
                contentPreview: typeof token?.content === 'string'
                  ? token.content.substring(0, 100)
                  : 'N/A',
              })

              // FILTER: Only stream content from the 'agent' or 'model' node
              // Skip 'tools' node (this contains raw tool JSON output)
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
            } else if (chunkAny.content && typeof chunkAny.content === 'string') {
              // Fallback: direct content string
              textContent = chunkAny.content
            }

            if (textContent) {
              console.log(`📝 Streaming to UI: ${textContent.substring(0, 50)}...`)

              controller.enqueue({
                type: 'text-delta',
                delta: textContent,
                id: textId,
              })
            }
          }
        } catch (error) {
          console.error('❌ Stream error:', error)
          throw error
        }

        console.log(`✅ Stream complete. Total state updates: ${chunkCount}`)

        // Signal end of text streaming
        controller.enqueue({
          type: 'text-end',
          id: textId,
        })

        controller.close()
      },
    })

    console.log('✅ Stream converted to UIMessageChunk format')

    // Convert to SSE response format that useChat() expects
    return createUIMessageStreamResponse({
      stream: messageChunks,
    })
  } catch (error) {
    // Error handling
    console.error('❌ LangChain error:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * LEARNING NOTES:
 *
 * 1. FLOW COMPARISON:
 *
 * Vercel AI SDK (/api/chat):
 * Request → streamText() → toUIMessageStreamResponse() → Response
 *
 * LangChain (/api/chat-langchain):
 * Request → ChatOpenAI → Prompt Template → Chain → Stream
 *   → Convert to UIMessageChunk → createUIMessageStreamResponse() → Response
 *
 * More steps, but more control and extensibility!
 *
 * 2. KEY CONCEPTS:
 * - ChatOpenAI: Wrapper for OpenAI-compatible APIs (like OpenRouter)
 * - ChatPromptTemplate: Reusable prompt structure with variables
 * - Chain (|): Composable pipeline of operations (like Unix pipes)
 * - UIMessageChunk: AI SDK v6 structured streaming format
 * - Data Stream Protocol: SSE format with text-start/delta/end chunks
 *
 * 3. STREAMING BRIDGE EXPLAINED:
 * Why we need manual stream conversion:
 * - LangChain: Returns AsyncIterator<AIMessageChunk>
 * - AI SDK useChat(): Expects ReadableStream<UIMessageChunk> in SSE format
 * - Our bridge: Converts LangChain chunks to {type, id, delta} format
 * - Alternative: Build custom frontend (200+ lines) or lose LangChain features
 *
 * This 30-line conversion unlocks enterprise features while keeping useChat() hook!
 *
 * 4. WHAT'S MISSING (we'll add next):
 * - Tools: Let the AI call functions (getExchangeRate, getNews)
 * - Memory: Remember previous messages in the conversation
 * - Agents: Let AI decide which tools to use and when
 *
 * 5. TESTING:
 * The FloatingChatWidget already points to /api/chat-langchain, so just:
 * 1. Open your app at http://localhost:3000
 * 2. Click the chat widget
 * 3. Ask: "What is Bitcoin?"
 * 4. Watch the streaming response appear in real-time!
 *
 * 6. NEXT STEPS:
 * - Add getExchangeRate tool (convert from Vercel AI SDK format)
 * - Compare tool calling: Vercel AI SDK vs LangChain
 * - Add BufferWindowMemory for conversation history
 * - See how memory changes the conversation flow
 */
