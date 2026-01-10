/**
 * Message Trimming Middleware
 *
 * Prevents context window overflow by keeping only recent messages.
 *
 * Learning Goals:
 * - Understand LangChain middleware pattern
 * - Learn about context window management
 * - See how to prevent token limit errors
 */

import {createMiddleware} from 'langchain'
import {MemorySaver, REMOVE_ALL_MESSAGES} from '@langchain/langgraph'
import {RemoveMessage} from '@langchain/core/messages'

/**
 * Configuration: Maximum number of messages to keep in conversation history
 *
 * Context Window Management:
 * - Each message consumes tokens (user input + AI response)
 * - Long conversations can exceed model's context window
 * - This middleware keeps only the most recent N messages
 *
 * Recommendations:
 * - 5 messages = 2-3 conversation turns (good for focused chats)
 * - 10 messages = 5 conversation turns (good for longer discussions)
 * - 20+ messages = may exceed context window on smaller models
 */
export const MESSAGE_LIMIT = 5

/**
 * Create middleware to trim conversation history
 *
 * How it works:
 * 1. beforeModel hook runs BEFORE each LLM call
 * 2. Checks if message count exceeds MESSAGE_LIMIT
 * 3. If yes, keeps only the last MESSAGE_LIMIT messages
 * 4. Uses RemoveMessage with REMOVE_ALL_MESSAGES to clear old history
 *
 * Why this matters:
 * - Prevents "context too long" errors
 * - Keeps conversations focused on recent context
 * - Improves response quality (agent focuses on recent messages)
 * - Reduces token usage (lower costs)
 *
 * @returns LangChain middleware instance
 */
export const createTrimMessagesMiddleware = () => {
  return createMiddleware({
    name: 'TrimMessages',
    beforeModel: state => {
      const messages = state.messages

      // If we're within limit, don't trim
      if (messages.length <= MESSAGE_LIMIT) {
        console.log(
          `📊 Message count: ${messages.length} (within limit of ${MESSAGE_LIMIT})`,
        )
        return // No changes needed
      }

      console.log(
        `✂️  Trimming messages: ${messages.length} → ${MESSAGE_LIMIT}`,
      )

      // Keep the last MESSAGE_LIMIT messages
      const recentMessages = messages.slice(-MESSAGE_LIMIT)

      // Return new state with trimmed messages
      // REMOVE_ALL_MESSAGES clears history, then we add recent messages back
      return {
        messages: [
          new RemoveMessage({id: REMOVE_ALL_MESSAGES}),
          ...recentMessages,
        ],
      }
    },
  })
}

/**
 * LEARNING NOTES:
 *
 * 1. MIDDLEWARE LIFECYCLE:
 * createAgent() supports 4 middleware hooks:
 * - beforeAgent: Runs before entire agent execution
 * - beforeModel: Runs before EACH LLM call (we use this!)
 * - afterModel: Runs after each LLM response
 * - afterAgent: Runs after agent completes
 *
 * 2. WHY TRIM BEFORE MODEL?
 * - We want to trim BEFORE sending to LLM
 * - This prevents "context too long" errors
 * - afterModel would be too late (error already happened)
 *
 * 3. MESSAGE REMOVAL PATTERN:
 * Option A (our approach):
 *   - REMOVE_ALL_MESSAGES clears entire history
 *   - Then add back recent messages
 *   - Clean and predictable
 *
 * Option B (alternative):
 *   - Create RemoveMessage for each old message by ID
 *   - More granular, but more complex
 *
 * 4. CONVERSATION MEMORY TRADE-OFFS:
 * Too few messages (< 3):
 *   ❌ Agent forgets context quickly
 *   ❌ Can't reference earlier conversation
 *
 * Too many messages (> 20):
 *   ❌ May exceed context window
 *   ❌ Higher token costs
 *   ❌ Agent may get confused by too much context
 *
 * Sweet spot (5-10):
 *   ✅ Good context retention
 *   ✅ Manageable token usage
 *   ✅ Focused conversations
 *
 * 5. ALTERNATIVE STRATEGIES:
 * Instead of simple trimming, you could:
 * - Summarize old messages (keep summary + recent messages)
 * - Use semantic similarity (keep most relevant messages)
 * - Keep important messages (system prompts, key decisions)
 * - Different limits for different types of conversations
 *
 * For learning purposes, simple trimming is perfect!
 */
