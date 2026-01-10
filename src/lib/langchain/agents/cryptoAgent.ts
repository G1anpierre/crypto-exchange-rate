/**
 * Crypto Agent Factory
 *
 * Creates a ReactAgent configured for cryptocurrency Q&A.
 *
 * Learning Goals:
 * - Understand agent factory pattern
 * - See how to combine tools + memory + middleware
 * - Learn ReAct (Reasoning + Acting) pattern
 */

import {createAgent} from 'langchain'
import {MemorySaver} from '@langchain/langgraph'
import {createChatModel} from '../config/models'
import {createTrimMessagesMiddleware} from '../middleware/trimMessages'
import {getExchangeRateTool, getNewsTool, compareCoinsTool} from '../tools'

/**
 * System prompt for the cryptocurrency chat agent
 *
 * This defines the agent's:
 * - Role and personality
 * - Capabilities and limitations
 * - Tool usage instructions
 * - Safety guidelines
 */
const CRYPTO_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant for CryptoCurrent, a cryptocurrency exchange platform.

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

Be conversational, friendly, and informative. Use emojis sparingly. Keep responses concise but thorough.`

/**
 * Create a cryptocurrency chat agent
 *
 * This factory function creates a ReactAgent with:
 * - Tool calling capabilities (exchange rates, news, comparisons)
 * - Conversation memory (remembers context across messages)
 * - Message trimming (prevents context overflow)
 *
 * ReAct Pattern (Reasoning + Acting):
 * 1. THINK: Analyze user's question with conversation context
 * 2. ACT: Decide if tools are needed (and which ones)
 * 3. OBSERVE: Read tool results
 * 4. THINK: Formulate response based on observations
 * 5. RESPOND: Answer the user
 *
 * @param threadId - Unique identifier for this conversation thread
 *                   Used by checkpointer to maintain conversation state
 * @returns Configured ReactAgent ready for streaming
 */
export function createCryptoAgent() {
  // 1. Initialize the LLM (Language Model)
  const llm = createChatModel(0.7) // 0.7 = balanced temperature

  // 2. Define tools available to the agent
  const tools = [
    getExchangeRateTool, // Get real-time crypto prices from multiple exchanges
    getNewsTool, // Fetch latest cryptocurrency news
    compareCoinsTool, // Compare multiple cryptocurrencies side-by-side
  ]

  console.log(
    '🛠️  Tools loaded:',
    tools.map(t => t.name),
  )

  // 3. Create middleware
  const middleware = [createTrimMessagesMiddleware()]

  // 4. Create checkpointer for conversation memory
  // MemorySaver stores conversation state in memory
  // For production, consider PostgresSaver or RedisSaver
  const checkpointer = new MemorySaver()

  // 5. Create the ReactAgent
  const agent = createAgent({
    model: llm,
    tools,
    systemPrompt: CRYPTO_AGENT_SYSTEM_PROMPT,
    middleware,
    checkpointer,
  })

  console.log('🧠 Crypto agent created with memory and middleware')

  return agent
}

/**
 * LEARNING NOTES:
 *
 * 1. FACTORY PATTERN:
 * Why use a factory function instead of exporting an agent directly?
 * - Flexibility: Can create multiple agents with different configs
 * - Testing: Easy to mock or customize for tests
 * - Initialization: API keys are validated when agent is created
 * - Reusability: Same factory can create agents for different purposes
 *
 * 2. AGENT ANATOMY:
 * A complete agent needs:
 * - model: The LLM that does reasoning
 * - tools: Functions the agent can call
 * - systemPrompt: Instructions that guide behavior
 * - middleware: Pre/post processing (like message trimming)
 * - checkpointer: Memory storage for conversation state
 *
 * 3. REACT PATTERN EXPLAINED:
 * Traditional chatbot: Question → Answer (no thinking)
 * ReAct agent: Question → Think → Maybe call tools → Think → Answer
 *
 * Example flow:
 * User: "What's the Bitcoin price?"
 * Agent thinks: "I need current price data, I should use get_exchange_rate tool"
 * Agent calls: get_exchange_rate("BTC")
 * Agent observes: {"binance": 45000, "coinbase": 45100, ...}
 * Agent thinks: "Coinbase is slightly higher, 0.22% difference"
 * Agent responds: "Bitcoin is trading at $45,000 on Binance (best price)..."
 *
 * 4. CHECKPOINTER (MEMORY):
 * Why we need it:
 * - Agents are stateless by default (forget everything after each message)
 * - Checkpointer saves conversation state after each turn
 * - Uses thread_id to separate different conversations
 *
 * Memory types:
 * - MemorySaver: In-memory (lost on restart, good for dev)
 * - PostgresSaver: Database (persistent, good for prod)
 * - RedisSaver: Cache (fast, good for high-traffic apps)
 *
 * 5. MIDDLEWARE:
 * Think of middleware as "interceptors" that can:
 * - beforeAgent: Modify input before agent processes it
 * - beforeModel: Trim messages, add context, filter
 * - afterModel: Format response, add metadata
 * - afterAgent: Log results, track analytics
 *
 * Our trimMessages middleware runs beforeModel to prevent context overflow.
 *
 * 6. TOOLS VS FUNCTIONS:
 * - Tools: Structured with schemas, validated inputs, agent decides when to use
 * - Regular functions: Direct calls, no agent involvement
 *
 * Tools give the agent autonomy to decide WHEN and HOW to use capabilities.
 *
 * 7. SYSTEM PROMPT IMPORTANCE:
 * The system prompt is your primary way to control agent behavior:
 * - Too vague: Agent doesn't know when to use tools
 * - Too strict: Agent becomes inflexible
 * - Just right: Clear guidelines with examples
 *
 * Our prompt includes:
 * - Role definition (what the agent is)
 * - Tool usage examples (when to use each tool)
 * - Safety guidelines (no financial advice)
 * - Multi-tool orchestration (can use multiple tools)
 *
 * 8. FUTURE ENHANCEMENTS:
 * Easy to add:
 * - More tools (portfolio tracking, alerts)
 * - Different models (GPT-4, Claude)
 * - Custom middleware (PII filtering, moderation)
 * - Advanced memory (summarization, semantic search)
 * - Multiple agents (expert routing)
 */
