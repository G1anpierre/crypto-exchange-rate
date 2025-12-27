import { createWorkersAI } from 'workers-ai-provider';
import { streamText, tool, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { z } from 'zod';
import { getExchangeRate } from '@/services/exchangeRate';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Initialize Cloudflare Workers AI with API credentials
  const workersai = createWorkersAI({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiKey: process.env.CLOUDFLARE_API_KEY!,
  });

  const result = streamText({
    // Using Llama 3.1 70B - FINAL ATTEMPT with most powerful Cloudflare model
    // 70B parameters = best instruction following and reasoning capabilities
    // Costs ~140 neurons per request = ~71 requests/day with 10,000 free neurons
    // Native function calling support built into Llama 3.1
    // If this fails: revert to OpenRouter (proven working)
    // Previously tried and failed:
    // - @cf/mistralai/mistral-small-3.1-24b-instruct (24B, empty responses)
    // - @hf/nousresearch/hermes-2-pro-mistral-7b (7B, no tool calls)
    // - @cf/meta/llama-3.1-8b-instruct (8B, raw JSON responses)
    model: workersai('@cf/meta/llama-3.1-70b-instruct'),
    stopWhen: stepCountIs(5), // CRITICAL: Allow AI to continue after tool calls to provide summaries
    system: `You are a helpful AI assistant for CryptoCurrent, a cryptocurrency exchange platform.

Your role is to:
- Help users understand cryptocurrency exchange rates and pricing
- Summarize and explain crypto news in detail
- Educate users about cryptocurrency concepts, blockchain, wallets, and trading
- Provide accurate, helpful information about crypto markets
- NEVER provide financial advice or investment recommendations
- Always emphasize that crypto investments carry risks

IMPORTANT INSTRUCTIONS FOR TOOL USAGE:
- When you use the getNews tool, ALWAYS provide a detailed summary of the articles returned
- Format news summaries with bullet points highlighting key points from each article
- When you use the getExchangeRate tool, explain what the rate means and any relevant context
- When you use the educateCrypto tool, provide a comprehensive explanation

Be conversational, friendly, and informative. Use emojis sparingly. Keep responses concise but thorough.`,
    messages: await convertToModelMessages(messages),
    tools: {
      getExchangeRate: tool({
        description: 'Get current exchange rate between cryptocurrency and fiat currency',
        inputSchema: z.object({
          fromCryptoCurrency: z.string().describe('Cryptocurrency symbol like BTC, ETH, LTC'),
          toFiatCurrency: z.string().describe('Fiat currency code like USD, EUR, GBP'),
        }),
        execute: async ({ fromCryptoCurrency, toFiatCurrency }) => {
          try {
            const data = await getExchangeRate(fromCryptoCurrency.toUpperCase(), toFiatCurrency.toUpperCase());

            if (data['Realtime Currency Exchange Rate']) {
              const rate = data['Realtime Currency Exchange Rate'];
              return {
                success: true,
                from: rate['1. From_Currency Code'],
                fromName: rate['2. From_Currency Name'],
                to: rate['3. To_Currency Code'],
                toName: rate['4. To_Currency Name'],
                rate: rate['5. Exchange Rate'],
                lastRefreshed: rate['6. Last Refreshed'],
                timezone: rate['7. Time Zone'],
                bidPrice: rate['8. Bid Price'],
                askPrice: rate['9. Ask Price'],
              };
            } else {
              return {
                success: false,
                error: 'Unable to fetch exchange rate. Please check the currency symbols.',
              };
            }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
            };
          }
        },
      }),

      getNews: tool({
        description: 'Fetch recent cryptocurrency news from a specific source',
        inputSchema: z.object({
          source: z.enum(['coindesk', 'cointelegraph', 'decrypt', 'theblock', 'bitcoinmagazine'])
            .describe('News source name'),
          limit: z.number().optional().default(5)
            .describe('Number of articles, max 10'),
        }),
        execute: async ({ source, limit = 5 }) => {
          try {
            // Fetch news from the API route
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news?source=${source}`,
              { cache: 'no-store' }
            );

            if (!response.ok) {
              return {
                success: false,
                error: 'Failed to fetch news from the API',
              };
            }

            const articles = await response.json();

            // Limit the number of articles
            const limitedArticles = articles.slice(0, Math.min(limit, 10));

            return {
              success: true,
              source,
              articleCount: limitedArticles.length,
              articles: limitedArticles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.createdAt,
              })),
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to fetch news',
            };
          }
        },
      }),

      educateCrypto: tool({
        description: 'Explain cryptocurrency concepts and blockchain technology',
        inputSchema: z.object({
          topic: z.string().describe('Topic to explain like blockchain, wallets, trading'),
          detailLevel: z.enum(['brief', 'detailed']).optional().default('brief')
            .describe('Detail level: brief or detailed'),
        }),
        execute: async ({ topic, detailLevel = 'brief' }) => {
          // This tool doesn't make API calls - it signals the LLM to provide educational content
          // The LLM will use its knowledge to explain the topic
          return {
            success: true,
            topic,
            detailLevel,
            message: `Please provide a ${detailLevel} explanation of: ${topic}`,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
