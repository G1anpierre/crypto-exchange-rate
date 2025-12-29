import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText, tool, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { z } from 'zod';
import { getMultiExchangeRate, getExchangeRate as getCCXTRate } from '@/services/ccxt/exchangeRate';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Using Meta Llama 3.3 70B (free) - powerful model with tool calling support
    // Alternative free options:
    // - google/gemini-2.0-flash-exp:free (fast, reliable)
    // - qwen/qwq-32b:free (good reasoning)
    // - deepseek/deepseek-chat-v3-0324:free (very capable)
    model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
    stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and responses
    system: `You are a helpful AI assistant for CryptoCurrent, a cryptocurrency exchange platform.

Your role is to:
- Help users understand cryptocurrency exchange rates and pricing across multiple exchanges
- Show price comparisons from Binance, Coinbase, and Kraken simultaneously
- Detect and explain arbitrage opportunities (price differences between exchanges)
- Summarize and explain crypto news in detail
- Educate users about cryptocurrency concepts, blockchain, wallets, and trading
- Provide accurate, helpful information about crypto markets
- NEVER provide financial advice or investment recommendations
- Always emphasize that crypto investments carry risks

IMPORTANT INSTRUCTIONS FOR TOOL USAGE:
- When you use the getExchangeRate tool, you'll receive prices from 3 exchanges - ALWAYS show all of them
- Highlight which exchange has the best (lowest) price
- If there's an arbitrage opportunity (>0.1% price difference), mention it explicitly
- Explain that USDT is Tether, a stablecoin pegged 1:1 to USD
- When you use the getNews tool, ALWAYS provide a detailed summary of the articles returned
- Format news summaries with bullet points highlighting key points from each article
- When you use the educateCrypto tool, provide a comprehensive explanation

FORMATTING TIPS:
- When showing prices from multiple exchanges, use a clear list format
- Example: "BTC prices: Binance $87,634, Coinbase $87,531 (best), Kraken $87,532"
- If arbitrage exists, explain: "You could buy on Coinbase and sell on Binance for a 0.12% profit"

Be conversational, friendly, and informative. Use emojis sparingly. Keep responses concise but thorough.`,
    messages: await convertToModelMessages(messages),
    tools: {
      getExchangeRate: tool({
        description: 'Get cryptocurrency exchange rates from multiple exchanges with arbitrage detection. Shows prices from Binance, Coinbase, and Kraken simultaneously.',
        inputSchema: z.object({
          fromCryptoCurrency: z.string().describe('Cryptocurrency symbol like BTC, ETH, SOL, XRP'),
          toFiatCurrency: z.string().describe('Fiat currency code like USD, EUR, CHF, GBP'),
        }),
        execute: async ({ fromCryptoCurrency, toFiatCurrency }) => {
          try {
            const crypto = fromCryptoCurrency.toUpperCase();
            const fiat = toFiatCurrency.toUpperCase();

            // Smart currency handling:
            // - Most exchanges use USDT (Tether) instead of USD
            // - Kraken supports real fiat: USD, EUR, CHF
            // - Coinbase supports USD
            let targetCurrency = fiat;
            let exchanges = ['binance', 'coinbase', 'kraken'];

            // If user asks for USD, try USDT first (most liquid), fallback to USD
            if (fiat === 'USD') {
              targetCurrency = 'USDT'; // Most exchanges use USDT
            }

            // Fetch from multiple exchanges
            const data = await getMultiExchangeRate(crypto, targetCurrency, exchanges);

            // Format response for the LLM
            return {
              success: true,
              pair: data.pair,
              prices: data.results.map(r => ({
                exchange: r.exchange,
                price: r.price,
                volume24h: r.volume24h,
                change24h: r.changePercent24h,
              })),
              bestPrice: {
                exchange: data.bestPrice.exchange,
                price: data.bestPrice.price,
                message: `Cheapest on ${data.bestPrice.exchange}`,
              },
              worstPrice: {
                exchange: data.worstPrice.exchange,
                price: data.worstPrice.price,
                message: `Most expensive on ${data.worstPrice.exchange}`,
              },
              averagePrice: data.averagePrice,
              arbitrageOpportunity: data.priceSpreadPercent > 0.1 ? {
                spreadPercent: data.priceSpreadPercent,
                spreadAmount: data.priceSpread,
                buyOn: data.bestPrice.exchange,
                sellOn: data.worstPrice.exchange,
                message: `Arbitrage opportunity: Buy on ${data.bestPrice.exchange}, sell on ${data.worstPrice.exchange} for ${data.priceSpreadPercent.toFixed(2)}% profit`,
              } : null,
              note: targetCurrency === 'USDT' ? 'Note: Prices shown in USDT (Tether stablecoin), which is pegged 1:1 to USD' : null,
            };
          } catch (error) {
            // Fallback: Try single exchange if multi-exchange fails
            try {
              const crypto = fromCryptoCurrency.toUpperCase();
              let fiat = toFiatCurrency.toUpperCase();
              let exchange = 'binance';

              // Smart fallback: Use USDT for Binance, USD for Kraken
              if (fiat === 'USD' || fiat === 'EUR' || fiat === 'CHF') {
                exchange = 'kraken'; // Kraken supports real fiat
              } else {
                fiat = 'USDT'; // Binance uses USDT
              }

              const singleData = await getCCXTRate(crypto, fiat, exchange);

              return {
                success: true,
                pair: singleData.pair,
                exchange: singleData.exchange,
                price: singleData.price,
                volume24h: singleData.volume24h,
                change24h: singleData.changePercent24h,
                high24h: singleData.high24h,
                low24h: singleData.low24h,
                message: 'Single exchange data (multi-exchange comparison unavailable)',
              };
            } catch (fallbackError) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
                suggestion: 'Try a different currency pair or check the cryptocurrency symbol',
              };
            }
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
