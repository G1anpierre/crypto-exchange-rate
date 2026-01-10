/**
 * LangChain Model Configuration
 *
 * Centralized LLM initialization for consistency across agents.
 *
 * Learning Goals:
 * - Understand model provider configuration (Groq)
 * - See how to make LLM config reusable
 * - Learn about model selection criteria
 */

import {ChatGroq} from '@langchain/groq'

/**
 * Create a ChatGroq instance configured for cryptocurrency chat
 *
 * Model Selection Criteria:
 * - ✅ Must support tool calling (function calling)
 * - ✅ Fast inference (good for real-time chat)
 * - ✅ Generous free tier (30 req/min on Groq)
 * - ✅ Large context window (128k tokens)
 *
 * GROQ MODELS (Free tier: 30 req/min):
 * - ✅ llama-3.3-70b-versatile (best for tool calling, 128k context)
 * - ✅ llama-3.1-70b-versatile (supports tools, fast)
 * - ✅ mixtral-8x7b-32768 (supports tools)
 *
 * @param temperature - Controls randomness (0 = deterministic, 1 = creative)
 * @returns Configured ChatGroq instance
 */
export function createChatModel(temperature: number = 0.7) {
  // Validate API key exists
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required')
  }

  const llm = new ChatGroq({
    // Model name - MUST support tool calling!
    model: 'llama-3.3-70b-versatile',

    // Temperature: 0.7 = balanced (0 = deterministic, 1 = creative)
    temperature,

    // API Key from environment variable
    apiKey: process.env.GROQ_API_KEY,
  })

  console.log('🤖 LLM initialized:', {
    model: 'llama-3.3-70b-versatile',
    temperature,
    provider: 'Groq',
    supportsToolCalling: true,
  })

  return llm
}

/**
 * LEARNING NOTES:
 *
 * 1. WHY CENTRALIZE MODEL CONFIG?
 * - Single source of truth for model settings
 * - Easy to swap models (just change one line)
 * - Consistent configuration across all agents
 * - Easier to add model fallbacks or A/B testing
 *
 * 2. WHY GROQ?
 * - OpenRouter free tier: 50 req/day (too limiting!)
 * - Groq free tier: 30 req/min (much better for development)
 * - Groq has excellent tool calling support
 * - Fast inference times (good UX)
 *
 * 3. TEMPERATURE EXPLAINED:
 * - 0.0: Deterministic, same answer every time
 * - 0.7: Balanced (recommended for chat)
 * - 1.0: Creative, more varied responses
 * - For factual Q&A (like crypto prices), 0.7 works well
 *
 * 4. FUTURE IMPROVEMENTS:
 * - Add model fallback (if Groq fails, use OpenRouter)
 * - Support multiple model providers
 * - Add cost tracking
 * - Environment-based model selection (dev vs prod)
 */
