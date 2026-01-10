/**
 * LangChain Tool: Get Exchange Rate
 *
 * Fetches cryptocurrency exchange rates from multiple exchanges (Binance, Coinbase, Kraken)
 * with arbitrage detection.
 *
 * This is a conversion from Vercel AI SDK tool format to LangChain format.
 *
 * KEY DIFFERENCES:
 * - Vercel AI SDK: Returns objects
 * - LangChain: Must return STRINGS (we use JSON.stringify)
 *
 * - Vercel AI SDK: Uses `inputSchema`
 * - LangChain: Uses `schema`
 *
 * - Vercel AI SDK: Uses `execute` function
 * - LangChain: Function is the first parameter
 */

import {tool} from '@langchain/core/tools'
import {z} from 'zod'
import {
  getMultiExchangeRate,
  getExchangeRate as getCCXTRate,
} from '@/services/ccxt/exchangeRate'

export const getExchangeRateTool = tool(
  async ({fromCryptoCurrency, toFiatCurrency}) => {
    console.log(`💱 getExchangeRate tool called:`, {
      fromCryptoCurrency,
      toFiatCurrency,
      fromType: typeof fromCryptoCurrency,
      toType: typeof toFiatCurrency,
    })

    try {
      const crypto = fromCryptoCurrency.toUpperCase()
      const fiat = toFiatCurrency.toUpperCase()

      // Smart currency handling:
      // - Most exchanges use USDT (Tether) instead of USD
      // - Kraken supports real fiat: USD, EUR, CHF
      // - Coinbase supports USD
      let targetCurrency = fiat
      const exchanges = ['binance', 'coinbase', 'kraken']

      // If user asks for USD, try USDT first (most liquid), fallback to USD
      if (fiat === 'USD') {
        targetCurrency = 'USDT' // Most exchanges use USDT
      }

      // Fetch from multiple exchanges
      const data = await getMultiExchangeRate(crypto, targetCurrency, exchanges)

      // IMPORTANT: LangChain tools MUST return strings!
      // We format as JSON for the agent to parse
      return JSON.stringify(
        {
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
          arbitrageOpportunity:
            data.priceSpreadPercent > 0.1
              ? {
                  spreadPercent: data.priceSpreadPercent,
                  spreadAmount: data.priceSpread,
                  buyOn: data.bestPrice.exchange,
                  sellOn: data.worstPrice.exchange,
                  message: `Arbitrage opportunity: Buy on ${data.bestPrice.exchange}, sell on ${data.worstPrice.exchange} for ${data.priceSpreadPercent.toFixed(2)}% profit`,
                }
              : null,
          note:
            targetCurrency === 'USDT'
              ? 'Note: Prices shown in USDT (Tether stablecoin), which is pegged 1:1 to USD'
              : null,
        },
        null,
        2,
      ) // Pretty print for agent readability
    } catch (error) {
      // Fallback: Try single exchange if multi-exchange fails
      try {
        const crypto = fromCryptoCurrency.toUpperCase()
        let fiat = toFiatCurrency.toUpperCase()
        let exchange = 'binance'

        // Smart fallback: Use USDT for Binance, USD for Kraken
        if (fiat === 'USD' || fiat === 'EUR' || fiat === 'CHF') {
          exchange = 'kraken' // Kraken supports real fiat
        } else {
          fiat = 'USDT' // Binance uses USDT
        }

        const singleData = await getCCXTRate(crypto, fiat, exchange)

        return JSON.stringify(
          {
            success: true,
            pair: singleData.pair,
            exchange: singleData.exchange,
            price: singleData.price,
            volume24h: singleData.volume24h,
            change24h: singleData.changePercent24h,
            high24h: singleData.high24h,
            low24h: singleData.low24h,
            message:
              'Single exchange data (multi-exchange comparison unavailable)',
          },
          null,
          2,
        )
      } catch (fallbackError) {
        return JSON.stringify(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch exchange rate',
            suggestion:
              'Try a different currency pair or check the cryptocurrency symbol',
          },
          null,
          2,
        )
      }
    }
  },
  {
    name: 'get_exchange_rate',
    description:
      'Get cryptocurrency exchange rates from multiple exchanges (Binance, Coinbase, Kraken) with arbitrage detection. Shows real-time prices, 24h volumes, and price changes. Use this when users ask about crypto prices, exchange rates, or want to compare prices across exchanges.',
    schema: z.object({
      fromCryptoCurrency: z
        .string()
        .min(1, 'Cryptocurrency symbol is required')
        .describe(
          'Cryptocurrency symbol (e.g., BTC, ETH, SOL, XRP, DOGE, ADA, DOT)',
        ),
      toFiatCurrency: z
        .string()
        .min(1, 'Fiat currency is required')
        .describe('Fiat currency code (e.g., USD, EUR, CHF, GBP)'),
    }),
  },
)

/**
 * COMPARISON: Vercel AI SDK vs LangChain Tool
 *
 * Vercel AI SDK format (/api/chat):
 * ────────────────────────────────────
 * import { tool } from 'ai'
 *
 * getExchangeRate: tool({
 *   description: '...',
 *   inputSchema: z.object({ ... }),
 *   execute: async ({ fromCryptoCurrency, toFiatCurrency }) => {
 *     return { success: true, prices: [...] }  // ← Returns object
 *   }
 * })
 *
 * LangChain format (/api/chat-langchain):
 * ───────────────────────────────────────
 * import { tool } from '@langchain/core/tools'
 *
 * export const getExchangeRateTool = tool(
 *   async ({ fromCryptoCurrency, toFiatCurrency }) => {  // ← Function first!
 *     return JSON.stringify({ ... })  // ← Returns STRING!
 *   },
 *   {
 *     name: 'get_exchange_rate',  // ← snake_case convention
 *     description: '...',
 *     schema: z.object({ ... })  // ← Called 'schema', not 'inputSchema'
 *   }
 * )
 *
 * KEY DIFFERENCES:
 * ════════════════
 * 1. Import source:
 *    - Vercel: 'ai'
 *    - LangChain: '@langchain/core/tools'
 *
 * 2. Function placement:
 *    - Vercel: Inside object as 'execute'
 *    - LangChain: First parameter
 *
 * 3. Return type:
 *    - Vercel: Object (JSON)
 *    - LangChain: String (JSON.stringify)
 *
 * 4. Schema property:
 *    - Vercel: inputSchema
 *    - LangChain: schema
 *
 * 5. Tool name:
 *    - Vercel: Property key (getExchangeRate)
 *    - LangChain: Explicit 'name' field (get_exchange_rate)
 *
 * 6. Naming convention:
 *    - Vercel: camelCase
 *    - LangChain: snake_case (recommended)
 */
