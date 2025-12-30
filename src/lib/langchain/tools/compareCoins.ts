/**
 * LangChain Tool: compareCoins
 *
 * Compares multiple cryptocurrencies side-by-side.
 * Fetches real-time prices from exchanges and provides insights.
 *
 * Uses existing infrastructure: src/services/ccxt/exchangeRate.ts
 */

import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { getMultiExchangeRate } from '@/services/ccxt/exchangeRate'

export const compareCoinsTool = tool(
  async ({ coins, fiatCurrency }) => {
    console.log(`📊 compareCoins tool called:`, {
      coins,
      fiatCurrency,
      coinsType: typeof coins,
      fiatType: typeof fiatCurrency,
      coinsCount: Array.isArray(coins) ? coins.length : 'N/A',
    })

    try {
      // Validate input
      if (coins.length < 2) {
        return JSON.stringify(
          {
            success: false,
            error: 'At least 2 coins are required for comparison',
            suggestion: 'Provide an array with 2 or more cryptocurrency symbols',
          },
          null,
          2
        )
      }

      if (coins.length > 10) {
        return JSON.stringify(
          {
            success: false,
            error: 'Maximum 10 coins allowed for comparison',
            suggestion: 'Please reduce the number of coins to compare',
          },
          null,
          2
        )
      }

      const targetCurrency = fiatCurrency === 'USD' ? 'USDT' : fiatCurrency
      const exchanges = ['binance', 'coinbase', 'kraken']

      // Fetch prices for all coins in parallel
      console.log(`🔄 Fetching prices for ${coins.length} coins...`)

      const results = await Promise.all(
        coins.map(async (coin) => {
          try {
            const crypto = coin.toUpperCase()
            const data = await getMultiExchangeRate(
              crypto,
              targetCurrency,
              exchanges
            )

            return {
              coin: crypto,
              success: true,
              pair: data.pair,
              averagePrice: data.averagePrice,
              bestPrice: data.bestPrice.price,
              bestExchange: data.bestPrice.exchange,
              volume24h:
                data.results.find((r) => r.volume24h)?.volume24h || null,
              change24h:
                data.results.find((r) => r.changePercent24h)
                  ?.changePercent24h || null,
            }
          } catch (error) {
            console.error(`❌ Error fetching ${coin}:`, error)
            return {
              coin: coin.toUpperCase(),
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : `Failed to fetch ${coin}`,
            }
          }
        })
      )

      // Filter successful results
      // Type guard: filter returns objects with all required properties
      const successfulResults = results.filter(
        (r): r is typeof r & { success: true; averagePrice: number; bestPrice: number; bestExchange: string } =>
          r.success === true
      )
      const failedResults = results.filter((r) => !r.success)

      if (successfulResults.length === 0) {
        return JSON.stringify(
          {
            success: false,
            error: 'Failed to fetch prices for all coins',
            failedCoins: failedResults.map((r) => r.coin),
            suggestion: 'Check coin symbols and try again',
          },
          null,
          2
        )
      }

      // Calculate insights
      const insights = {
        bestPerformer: successfulResults.reduce((best, current) =>
          (current.change24h || 0) > (best.change24h || 0) ? current : best
        ),
        worstPerformer: successfulResults.reduce((worst, current) =>
          (current.change24h || 0) < (worst.change24h || 0) ? current : worst
        ),
        cheapest: successfulResults.reduce((min, current) =>
          current.averagePrice < min.averagePrice ? current : min
        ),
        mostExpensive: successfulResults.reduce((max, current) =>
          current.averagePrice > max.averagePrice ? current : max
        ),
        highestVolume: successfulResults.reduce((max, current) =>
          (current.volume24h || 0) > (max.volume24h || 0) ? current : max
        ),
      }

      console.log(
        `✅ Comparison complete: ${successfulResults.length}/${coins.length} successful`
      )

      // CRITICAL: LangChain tools MUST return strings!
      return JSON.stringify(
        {
          success: true,
          fiatCurrency,
          timestamp: new Date().toISOString(),
          comparison: successfulResults.map((r) => ({
            coin: r.coin,
            pair: r.pair,
            averagePrice: r.averagePrice,
            bestPrice: r.bestPrice,
            bestExchange: r.bestExchange,
            volume24h: r.volume24h,
            change24h: r.change24h
              ? `${r.change24h > 0 ? '+' : ''}${r.change24h.toFixed(2)}%`
              : 'N/A',
          })),
          insights: {
            bestPerformer: {
              coin: insights.bestPerformer.coin,
              change24h: insights.bestPerformer.change24h
                ? `${insights.bestPerformer.change24h > 0 ? '+' : ''}${insights.bestPerformer.change24h.toFixed(2)}%`
                : 'N/A',
            },
            worstPerformer: {
              coin: insights.worstPerformer.coin,
              change24h: insights.worstPerformer.change24h
                ? `${insights.worstPerformer.change24h > 0 ? '+' : ''}${insights.worstPerformer.change24h.toFixed(2)}%`
                : 'N/A',
            },
            cheapest: {
              coin: insights.cheapest.coin,
              price: insights.cheapest.averagePrice,
            },
            mostExpensive: {
              coin: insights.mostExpensive.coin,
              price: insights.mostExpensive.averagePrice,
            },
            highestVolume: {
              coin: insights.highestVolume.coin,
              volume24h: insights.highestVolume.volume24h,
            },
          },
          failed: failedResults.length > 0 ? failedResults : undefined,
        },
        null,
        2
      )
    } catch (error) {
      console.error('❌ compareCoins tool error:', error)

      // Return error in structured format
      return JSON.stringify(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to compare coins',
          suggestion:
            'Please check coin symbols and try again. Common symbols: BTC, ETH, SOL, ADA, XRP, DOGE',
        },
        null,
        2
      )
    }
  },
  {
    name: 'compare_coins',
    description: `Compare multiple cryptocurrencies side-by-side with real-time prices and insights.

Use this tool when the user asks about:
- Comparing prices of multiple coins
- Which coin is performing better
- Price differences between cryptocurrencies
- Best/worst performers
- Cheapest/most expensive coins

The tool provides:
- Average prices from multiple exchanges (Binance, Coinbase, Kraken)
- Best price and exchange for each coin
- 24h price change percentage
- 24h trading volume
- Market cap (when available)
- Insights: best/worst performer, cheapest/most expensive, highest volume

Examples:
- "Compare Bitcoin and Ethereum" → coins: ["BTC", "ETH"]
- "Which is better: SOL, ADA, or XRP?" → coins: ["SOL", "ADA", "XRP"]
- "Compare top 5 coins" → coins: ["BTC", "ETH", "BNB", "SOL", "XRP"]

Note: Requires 2-10 coins for comparison.`,

    schema: z.object({
      coins: z
        .array(z.string().min(1, 'Coin symbol cannot be empty'))
        .min(2, 'At least 2 coins required for comparison')
        .max(10, 'Maximum 10 coins allowed')
        .describe(
          'Array of cryptocurrency symbols to compare (2-10 coins). Examples: ["BTC", "ETH"], ["SOL", "ADA", "XRP"]'
        ),
      fiatCurrency: z
        .string()
        .min(1, 'Fiat currency is required')
        .default('USD')
        .describe('Fiat currency to compare against (default: USD)'),
    }),
  }
)
