import {auth} from '@/auth'
import {prismaDB} from '@/database-prisma'
import {NextResponse} from 'next/server'

export async function POST() {
  try {
    const session = await auth()

    console.log('Session in newsletter subscribe:', session)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    // Check if user already has a subscription
    const existingSubscription =
      await prismaDB.newsletterSubscription.findUnique({
        where: {userId: session.user.id},
      })

    if (existingSubscription) {
      // If subscription exists but is inactive, reactivate it
      if (!existingSubscription.isActive) {
        const updatedSubscription =
          await prismaDB.newsletterSubscription.update({
            where: {userId: session.user.id},
            data: {isActive: true},
          })
        return NextResponse.json({
          message: 'Newsletter subscription reactivated successfully',
          subscription: updatedSubscription,
        })
      }

      return NextResponse.json(
        {error: 'You are already subscribed to the newsletter'},
        {status: 400},
      )
    }

    // Create new subscription
    const subscription = await prismaDB.newsletterSubscription.create({
      data: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Successfully subscribed to the weekly newsletter!',
      subscription,
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      {error: 'Failed to subscribe to newsletter'},
      {status: 500},
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const subscription = await prismaDB.newsletterSubscription.findUnique({
      where: {userId: session.user.id},
    })

    return NextResponse.json({
      isSubscribed: subscription?.isActive || false,
      subscription,
    })
  } catch (error) {
    console.error('Newsletter subscription check error:', error)
    return NextResponse.json(
      {error: 'Failed to check newsletter subscription'},
      {status: 500},
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const subscription = await prismaDB.newsletterSubscription.findUnique({
      where: {userId: session.user.id},
    })

    if (!subscription) {
      return NextResponse.json(
        {error: 'No active subscription found'},
        {status: 404},
      )
    }

    // Deactivate subscription instead of deleting
    await prismaDB.newsletterSubscription.update({
      where: {userId: session.user.id},
      data: {isActive: false},
    })

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      {error: 'Failed to unsubscribe from newsletter'},
      {status: 500},
    )
  }
}
