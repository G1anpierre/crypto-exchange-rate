import {fetchNewsBySource} from '@/services/rssFeedParser'
import {NextRequest, NextResponse} from 'next/server'

// Mark this route as dynamic (uses searchParams)
export const dynamic = 'force-dynamic'

// Enable caching for 5 minutes to reduce RSS feed requests
export const revalidate = 300 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source')

    if (!source) {
      return NextResponse.json(
        {error: 'Source parameter is required'},
        {status: 400},
      )
    }

    // Fetch news from RSS feed (server-side, no CORS issues)
    const articles = await fetchNewsBySource(source)

    // Transform to match the existing format
    const transformedArticles = articles.map(article => ({
      url: article.url,
      title: article.title,
      description: article.description || '',
      thumbnail: article.imageUrl || undefined,
      createdAt: article.publishedAt.toISOString(),
    }))

    // Return with cache headers (5 minutes)
    return NextResponse.json(transformedArticles, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500},
    )
  }
}
