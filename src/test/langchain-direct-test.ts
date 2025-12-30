/**
 * Direct LangChain Test - Bypass Streaming & UI Conversion
 *
 * This script tests the LangChain chatbot directly to isolate issues.
 * It eliminates streaming, UIMessageChunk conversion, and API route complexity.
 *
 * Run with: npx tsx src/test/langchain-direct-test.ts
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'

async function testLangChainDirect() {
  console.log('🧪 === LangChain Direct Test ===\n')

  // Initialize LLM (same config as API route)
  const llm = new ChatOpenAI({
    modelName: 'meta-llama/llama-3.3-70b-instruct:free',
    temperature: 0.7,
    streaming: false, // Disable streaming for simple test
    configuration: {
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    },
  })

  console.log('✅ LLM initialized:', {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    streaming: false,
    provider: 'OpenRouter',
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
  })

  // Create prompt template (simplified version)
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      'You are a helpful AI assistant for cryptocurrency. Answer questions about blockchain, crypto, and trading.',
    ],
    ['human', '{input}'],
  ])

  console.log('✅ Prompt template created\n')

  // Create chain
  const chain = prompt.pipe(llm)

  // Test Question
  const testQuestion = 'What is blockchain?'
  console.log(`📤 Sending question: "${testQuestion}"\n`)

  try {
    // Invoke chain (non-streaming)
    const result = await chain.invoke({
      input: testQuestion,
    })

    console.log('📥 Response received:\n')
    console.log('---')
    console.log(result.content)
    console.log('---\n')

    console.log('📊 Full result object:')
    console.log(JSON.stringify(result, null, 2))

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed with error:')
    console.error(error)
  }
}

// Run the test
testLangChainDirect().catch(console.error)
