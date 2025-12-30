/**
 * LangChain Tool: getNews
 *
 * Fetches cryptocurrency news from RSS feeds.
 * This tool allows the agent to provide real-time news updates,
 * something the LLM's knowledge cutoff prevents it from doing.
 *
 * Uses existing infrastructure: src/services/rssFeedParser.ts
 */

import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import {
  fetchAllNewsFromRSS,
  fetchNewsBySource,
} from '@/services/rssFeedParser'

export const getNewsTool = tool(
  async ({ source, limit }) => {
    console.log(`📰 getNews tool called:`, {
      source,
      limit,
      sourceType: typeof source,
      limitType: typeof limit,
    })

    try {
      // Fetch news from RSS feeds
      const articles =
        source === 'all'
          ? await fetchAllNewsFromRSS()
          : await fetchNewsBySource(source)

      if (!articles || articles.length === 0) {
        return JSON.stringify(
          {
            success: false,
            error: `No news found for source: ${source}`,
            suggestion:
              'Try "all" or one of: bitcoinist, cointelegraph, decrypt, bscnews',
          },
          null,
          2
        )
      }

      // Limit results
      const limitedArticles = articles.slice(0, limit)

      console.log(
        `✅ Fetched ${limitedArticles.length} articles from ${source}`
      )

      // CRITICAL: LangChain tools MUST return strings!
      return JSON.stringify(
        {
          success: true,
          source,
          count: limitedArticles.length,
          totalAvailable: articles.length,
          articles: limitedArticles.map((article) => ({
            title: article.title,
            description: article.description,
            source: article.source,
            url: article.url,
            publishedAt: article.publishedAt,
            category: article.category || 'General',
          })),
        },
        null,
        2
      )
    } catch (error) {
      console.error('❌ getNews tool error:', error)

      // Return error in structured format
      return JSON.stringify(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to fetch news',
          suggestion:
            'Please try again or ask for news from a specific source (bitcoinist, cointelegraph, decrypt, bscnews)',
        },
        null,
        2
      )
    }
  },
  {
    name: 'get_news',
    description: `Get the latest cryptocurrency news from RSS feeds.

Use this tool when the user asks about:
- Latest crypto news
- Recent developments in crypto
- News from specific sources (bitcoinist, cointelegraph, decrypt, bscnews)
- What's happening in the crypto world

Available sources:
- "all" (default): Fetches from all sources
- "bitcoinist": Bitcoin and cryptocurrency news
- "cointelegraph": Crypto market and blockchain news
- "decrypt": Web3 and NFT news
- "bscnews": Binance Smart Chain news

Examples:
- "What's the latest crypto news?" → source: "all", limit: 5
- "Show me news from CoinTelegraph" → source: "cointelegraph", limit: 5
- "Get Bitcoin news" → source: "bitcoinist", limit: 5`,

    schema: z.object({
      source: z
        .string()
        .default('all')
        .describe(
          'News source to fetch from. Options: "all", "bitcoinist", "cointelegraph", "decrypt", "bscnews"'
        ),
      limit: z
        .coerce.number() // Accept string or number, auto-convert to number
        .min(1, 'Limit must be at least 1')
        .max(20, 'Limit cannot exceed 20')
        .default(5)
        .describe('Number of articles to return (default: 5, max: 20)'),
    }),
  }
)
