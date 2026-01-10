'use client'

import {useEffect, useState} from 'react'
import {useSession} from 'next-auth/react'
import {Mail, CheckCircle2} from 'lucide-react'

export function NewsletterSubscriptionForm() {
  const {data: session, status} = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Check subscription status on mount
  useEffect(() => {
    if (status === 'authenticated') {
      checkSubscriptionStatus()
    }
  }, [status])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/newsletter/subscribe')
      const data = await response.json()
      setIsSubscribed(data.isSubscribed)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!session) {
      setMessage({
        type: 'error',
        text: 'Please sign in to subscribe to the newsletter',
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setMessage({
          type: 'success',
          text: data.message || 'Successfully subscribed to the newsletter!',
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to subscribe to newsletter',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while subscribing',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(false)
        setMessage({
          type: 'success',
          text: data.message || 'Successfully unsubscribed from the newsletter',
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to unsubscribe from newsletter',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while unsubscribing',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return null
  }

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:border-gray-700 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            Subscribe to Our Weekly Newsletter
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Get the top 5 crypto news stories delivered to your inbox every
            Tuesday
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Please sign in to subscribe to our newsletter
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:border-gray-700 dark:from-purple-950/20 dark:to-blue-950/20">
      <div className="text-center">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
          Weekly Crypto Newsletter
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Get the top 5 crypto news stories delivered to your inbox every
          Tuesday at 9 AM EST
        </p>

        {message && (
          <div
            className={`mt-4 rounded-md p-3 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6">
          {isSubscribed ? (
            <div>
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>You are subscribed to the newsletter</span>
              </div>
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Unsubscribe'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  )
}
