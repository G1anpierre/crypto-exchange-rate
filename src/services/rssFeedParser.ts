import Parser from 'rss-parser'
import {newsSources} from '@/static'

export interface ParsedArticle {
  title: string
  url: string
  description: string | null
  imageUrl: string | null
  source: string
  publishedAt: Date
  category: string | null
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
})

export async function parseRSSFeed(
  rssUrl: string,
  sourceName: string,
): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(rssUrl)

    const articles: ParsedArticle[] = feed.items.map(item => {
      // Extract image URL from various possible locations
      let imageUrl: string | null = null

      // Try media:content first
      if (item.media && typeof item.media === 'object') {
        const media = item.media as any
        if (media.$ && media.$.url) {
          imageUrl = media.$.url
        }
      }

      // Try enclosure
      if (!imageUrl && item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url
      }

      // Try to extract from content:encoded
      if (!imageUrl && item.contentEncoded) {
        const imgMatch = (item.contentEncoded as string).match(
          /<img[^>]+src="([^">]+)"/,
        )
        if (imgMatch) {
          imageUrl = imgMatch[1]
        }
      }

      // Extract description
      let description: string | null =
        item.contentSnippet || item.content || null
      if (description && description.length > 500) {
        description = description.substring(0, 497) + '...'
      }

      // Extract category from categories array
      let category: string | null = null
      if (item.categories && item.categories.length > 0) {
        category = item.categories[0]
      }

      return {
        title: item.title || 'No title',
        url: item.link || item.guid || '',
        description,
        imageUrl,
        source: sourceName,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        category,
      }
    })

    return articles.filter(article => article.url) // Filter out articles without URLs
  } catch (error) {
    console.error(`Error parsing RSS feed for ${sourceName}:`, error)
    return []
  }
}

export async function fetchAllNewsFromRSS(): Promise<ParsedArticle[]> {
  const allArticles: ParsedArticle[] = []

  // Fetch from all sources in parallel
  const promises = newsSources
    .filter(source => source.rssUrl) // Only sources with RSS URLs
    .map(async source => {
      const articles = await parseRSSFeed(source.rssUrl!, source.name)
      return articles
    })

  const results = await Promise.all(promises)

  // Flatten the results
  results.forEach(articles => {
    allArticles.push(...articles)
  })

  // Sort by published date (newest first)
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return allArticles
}

export async function fetchNewsBySource(
  sourceName: string,
): Promise<ParsedArticle[]> {
  const source = newsSources.find(
    s => s.searchParams === sourceName.toLowerCase(),
  )

  if (!source || !source.rssUrl) {
    throw new Error(`Source ${sourceName} not found or has no RSS URL`)
  }

  return parseRSSFeed(source.rssUrl, source.name)
}
