import {prismaDB} from '@/database-prisma'
import {NextRequest, NextResponse} from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        {error: 'Unsubscribe token is required'},
        {status: 400},
      )
    }

    const subscription = await prismaDB.newsletterSubscription.findUnique({
      where: {unsubscribeToken: token},
    })

    if (!subscription) {
      return NextResponse.json(
        {error: 'Invalid unsubscribe token'},
        {status: 404},
      )
    }

    if (!subscription.isActive) {
      return NextResponse.json({
        message: 'You are already unsubscribed from the newsletter',
      })
    }

    // Deactivate the subscription
    await prismaDB.newsletterSubscription.update({
      where: {unsubscribeToken: token},
      data: {isActive: false},
    })

    // Redirect to a confirmation page or return success message
    // For now, we'll return JSON, but you can create an HTML page later
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed - Crypto Exchange</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #333;
              margin-bottom: 1rem;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            a {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              transition: background 0.3s;
            }
            a:hover {
              background: #5568d3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✓</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from our weekly crypto newsletter. We're sad to see you go!</p>
            <p>If you change your mind, you can always resubscribe from your account settings.</p>
            <a href="/">Return to Homepage</a>
          </div>
        </body>
      </html>
    `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      {error: 'Failed to unsubscribe from newsletter'},
      {status: 500},
    )
  }
}
