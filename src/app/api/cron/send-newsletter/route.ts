import {prismaDB} from '@/database-prisma'
import WeeklyNewsletter from '@/emails/WeeklyNewsletter'
import {NextRequest, NextResponse} from 'next/server'
import {Resend} from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Verify request is from Vercel Cron
function verifyCronRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return false
    }
  }

  return true
}

// Select top 5 articles with source diversity (1 from each of 5 sources)
async function selectTop5ArticlesWithDiversity() {
  // Get articles from the past 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const articles = await prismaDB.newsArticle.findMany({
    where: {
      publishedAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  })

  if (articles.length === 0) {
    return []
  }

  // Group articles by source
  const articlesBySource = new Map<string, typeof articles>()

  articles.forEach(article => {
    if (!articlesBySource.has(article.source)) {
      articlesBySource.set(article.source, [])
    }
    articlesBySource.get(article.source)!.push(article)
  })

  // Select the most recent article from each source
  const selectedArticles: {
    id: string
    title: string
    url: string
    description: string | null
    imageUrl: string | null
    source: string
    publishedAt: Date
    category: string | null
    createdAt: Date
  }[] = []
  const sources = Array.from(articlesBySource.keys())

  for (const source of sources) {
    const sourceArticles = articlesBySource.get(source)!
    if (sourceArticles.length > 0) {
      // Get the most recent article from this source
      selectedArticles.push(sourceArticles[0])
    }

    // Stop when we have 5 articles
    if (selectedArticles.length === 5) {
      break
    }
  }

  // If we don't have 5 articles yet, fill with remaining most recent articles
  if (selectedArticles.length < 5) {
    const remainingArticles = articles.filter(
      article => !selectedArticles.some(selected => selected.id === article.id),
    )

    for (const article of remainingArticles) {
      selectedArticles.push(article)
      if (selectedArticles.length === 5) {
        break
      }
    }
  }

  return selectedArticles
}

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronRequest(request)) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    console.log('Starting weekly newsletter send...')

    // Get all active subscribers
    const subscribers = await prismaDB.newsletterSubscription.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: true,
      },
    })

    if (subscribers.length === 0) {
      console.log('No active subscribers found')
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to send newsletter to',
        stats: {recipientCount: 0},
      })
    }

    console.log(`Found ${subscribers.length} active subscribers`)

    // Select top 5 articles with source diversity
    const topArticles = await selectTop5ArticlesWithDiversity()

    if (topArticles.length === 0) {
      console.log('No articles found from the past week')
      return NextResponse.json({
        success: false,
        message: 'No articles found from the past week',
      })
    }

    console.log(`Selected ${topArticles.length} articles for newsletter`)

    // Prepare article data for email template
    const articles = topArticles.map(article => ({
      title: article.title,
      url: article.url,
      description: article.description,
      imageUrl: article.imageUrl,
      source: article.source,
      publishedAt: article.publishedAt,
    }))

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async subscriber => {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`

      try {
        await resend.emails.send({
          from: 'Crypto Exchange Newsletter <newsletter@swissprodone.com>',
          to: subscriber.user.email!,
          subject: `🚀 Top 5 Crypto News This Week - ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`,
          react: WeeklyNewsletter({
            articles,
            unsubscribeUrl,
            userName: subscriber.user.name || undefined,
          }),
        })

        return {success: true, email: subscriber.user.email}
      } catch (error) {
        console.error(
          `Failed to send email to ${subscriber.user.email}:`,
          error,
        )
        return {success: false, email: subscriber.user.email, error}
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Record newsletter send in database
    await prismaDB.newsletterSend.create({
      data: {
        articleIds: topArticles.map(a => a.id),
        recipientCount: successCount,
        subject: `Top 5 Crypto News This Week - ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`,
      },
    })

    console.log('Newsletter send completed:', {
      totalSubscribers: subscribers.length,
      successCount,
      failureCount,
      articlesCount: topArticles.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully',
      stats: {
        totalSubscribers: subscribers.length,
        successCount,
        failureCount,
        articlesCount: topArticles.length,
      },
    })
  } catch (error) {
    console.error('Error in send-newsletter cron:', error)
    return NextResponse.json(
      {
        error: 'Failed to send newsletter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500},
    )
  }
}
