import {prismaDB} from '@/database-prisma'
import {fetchAllNewsFromRSS} from '@/services/rssFeedParser'
import {NextRequest, NextResponse} from 'next/server'

// Verify request is from Vercel Cron
function verifyCronRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  // In production, Vercel Cron sends a secret in the Authorization header
  // For development, we'll allow requests without the header
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return false
    }
  }

  return true
}

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronRequest(request)) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    console.log('Starting daily news fetch...')

    // Fetch all news from RSS feeds
    const articles = await fetchAllNewsFromRSS()

    console.log(`Fetched ${articles.length} articles from RSS feeds`)

    // Store articles in database (upsert to avoid duplicates)
    let newArticlesCount = 0
    let updatedArticlesCount = 0

    for (const article of articles) {
      try {
        const existing = await prismaDB.newsArticle.findUnique({
          where: {url: article.url},
        })

        if (existing) {
          // Update existing article
          await prismaDB.newsArticle.update({
            where: {url: article.url},
            data: {
              title: article.title,
              description: article.description,
              imageUrl: article.imageUrl,
              category: article.category,
            },
          })
          updatedArticlesCount++
        } else {
          // Create new article
          await prismaDB.newsArticle.create({
            data: {
              title: article.title,
              url: article.url,
              description: article.description,
              imageUrl: article.imageUrl,
              source: article.source,
              publishedAt: article.publishedAt,
              category: article.category,
            },
          })
          newArticlesCount++
        }
      } catch (error) {
        console.error(`Error saving article ${article.url}:`, error)
      }
    }

    // Clean up old articles (older than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedArticles = await prismaDB.newsArticle.deleteMany({
      where: {
        publishedAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    console.log('News fetch completed:', {
      totalFetched: articles.length,
      newArticles: newArticlesCount,
      updatedArticles: updatedArticlesCount,
      deletedOldArticles: deletedArticles.count,
    })

    return NextResponse.json({
      success: true,
      message: 'News fetched and stored successfully',
      stats: {
        totalFetched: articles.length,
        newArticles: newArticlesCount,
        updatedArticles: updatedArticlesCount,
        deletedOldArticles: deletedArticles.count,
      },
    })
  } catch (error) {
    console.error('Error in fetch-news cron:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500},
    )
  }
}
