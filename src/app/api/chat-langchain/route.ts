/**
 * LangChain Chat API Route - V3: Modular Architecture
 *
 * Learning Goals:
 * 1. Understand modular architecture patterns
 * 2. See how to separate concerns (config, agents, streaming)
 * 3. Learn how clean code improves maintainability
 * 4. Practice reusable component design
 *
 * Architecture:
 * - ✅ Modular structure (config, agents, middleware, streaming)
 * - ✅ ReactAgent with tools (exchange rates, news, comparisons)
 * - ✅ Conversation memory (MemorySaver checkpointer)
 * - ✅ Message trimming middleware (prevents context overflow)
 * - ✅ Stream conversion (LangChain → AI SDK UIMessageChunk)
 *
 * This is a production-ready, educational implementation!
 */

import {createUIMessageStreamResponse} from 'ai'
import {auth} from '@/auth'
import {createCryptoAgent} from '@/lib/langchain/agents'
import {convertLangChainStreamToUI} from '@/lib/langchain/streaming'

// Allow streaming responses up to 30 seconds (same as Vercel AI SDK endpoint)
export const maxDuration = 30

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
      preview: conversationMessages.map(
        (m: any) => m.content.substring(0, 50) + '...',
      ),
    })

    // Log the last message for debugging
    const lastMessage = conversationMessages[conversationMessages.length - 1]
    console.log('📨 Latest message:', {
      role: lastMessage?.role,
      content: lastMessage?.content,
    })

    // 3. Create the cryptocurrency chat agent
    //
    // This factory function creates a fully configured ReactAgent with:
    // - ChatGroq LLM (llama-3.3-70b-versatile)
    // - 3 tools: getExchangeRate, getNews, compareCoins
    // - Conversation memory (MemorySaver checkpointer)
    // - Message trimming middleware (keeps last 5 messages)
    //
    // See src/lib/langchain/agents/cryptoAgent.ts for full implementation
    const agent = createCryptoAgent()

    console.log('🧠 Crypto agent ready for conversation')

    // 4. Stream the agent execution with conversation history
    //
    // Stream Modes:
    // - "values": Full state snapshots (entire conversation state)
    // - "updates": Agent step updates (reasoning, tool calls)
    // - "messages": LLM token stream (what we want for UI streaming!) ✅
    //
    // The agent will:
    // 1. THINK: Analyze the user's question with full conversation context
    // 2. ACT: Decide which tools (if any) to use
    // 3. OBSERVE: Read tool results
    // 4. RESPOND: Formulate answer and stream it to the UI
    const stream = await agent.stream(
      {
        messages: conversationMessages, // Pass full conversation history!
      },
      {
        streamMode: 'messages', // Stream LLM tokens in real-time
        configurable: {
          thread_id: threadId, // Required for checkpointer to save state
        },
      },
    )

    console.log('🌊 Starting stream with conversation history...', {
      threadId,
      messageCount: conversationMessages.length,
    })

    // 5. Convert LangChain stream to UIMessageChunk format
    //
    // This utility bridges LangChain's streaming format to AI SDK's format:
    // - LangChain: AsyncIterator<[token, metadata]>
    // - AI SDK useChat(): ReadableStream<UIMessageChunk>
    //
    // See src/lib/langchain/streaming/langchainToUI.ts for implementation
    const messageChunks = convertLangChainStreamToUI(stream)

    console.log('✅ Stream converted to UIMessageChunk format')

    // 6. Convert to SSE response format that useChat() expects
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
        headers: {'Content-Type': 'application/json'},
      },
    )
  }
}

/**
 * LEARNING NOTES: Modular Architecture
 *
 * 1. ARCHITECTURE OVERVIEW:
 *
 * Before (Monolithic - 483 lines):
 * route.ts contains everything:
 * - LLM configuration
 * - Middleware logic
 * - Agent creation with system prompt
 * - Stream conversion utilities
 *
 * After (Modular - ~150 lines):
 * src/lib/langchain/
 * ├── config/models.ts          → LLM initialization
 * ├── middleware/trimMessages.ts → Message management
 * ├── agents/cryptoAgent.ts     → Agent factory
 * └── streaming/langchainToUI.ts → Stream conversion
 *
 * route.ts becomes simple orchestration!
 *
 * 2. BENEFITS OF MODULAR STRUCTURE:
 *
 * ✅ Reusability: Create new agents easily by reusing components
 * ✅ Testability: Each module can be tested independently
 * ✅ Maintainability: Changes to one component don't affect others
 * ✅ Clarity: Each file has one clear purpose
 * ✅ Scalability: Easy to add new models, middleware, agents
 *
 * 3. REQUEST FLOW:
 *
 * 1. POST /api/chat-langchain
 * 2. Extract thread ID from session
 * 3. Convert AI SDK messages → LangChain format
 * 4. createCryptoAgent() → ReactAgent with tools + memory
 * 5. agent.stream() → Stream agent execution
 * 6. convertLangChainStreamToUI() → Convert to UIMessageChunk
 * 7. createUIMessageStreamResponse() → SSE response
 *
 * 4. FUTURE ENHANCEMENTS (NOW EASY!):
 *
 * Create new agents:
 * - createNewsAgent() for specialized news analysis
 * - createTradingAgent() for portfolio management
 * - createEducationAgent() for crypto education
 *
 * Add new middleware:
 * - PII filtering for privacy
 * - Content moderation for safety
 * - Custom logging for analytics
 *
 * Support multiple models:
 * - createChatModel('gpt-4') for OpenAI
 * - createChatModel('claude-3') for Anthropic
 * - Model fallback strategies
 *
 * 5. TESTING:
 * Open http://localhost:3000 → Click chat widget → Try:
 * - "What's the Bitcoin price?" (single tool)
 * - "Compare BTC and ETH" (comparison tool)
 * - "Bitcoin price and latest news" (multi-tool orchestration)
 * - "What is blockchain?" (no tools, just knowledge)
 *
 * 6. WHAT'S NEXT:
 * Phase 2 (optional): Add LangSmith for observability
 * - Trace agent reasoning steps
 * - Monitor tool usage
 * - Debug agent decisions
 * - Analyze conversation quality
 */
