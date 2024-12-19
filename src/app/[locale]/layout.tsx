

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {Providers} from '../providers'
import {Nav} from '@/components/Nav'
import {Footer} from '@/components/Footer'
import {Toaster} from '@/components/ui/toaster'
import {auth} from '@/auth'
import {headers} from 'next/headers'
import {cookieToInitialState} from 'wagmi'
import {getConfig} from '@/config'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Crypto Exchange App',
  description: 'Get the latest crypto exchange rates',
  keywords: ['crypto', 'exchange', 'rates'],
  openGraph: {
    title: 'Crypto Exchange App',
    description: 'Get the latest crypto exchange rates',
    type: 'website',
    locale: 'en_US',
    url: 'https://crypto-exchange-rate.vercel.app',
    images: [
      {
        url: 'https://ccrypto-exchange-rate.vercel.app/cryptocurrent-favicon-black.png',
        width: 800,
        height: 600,
        alt: 'Crypto Exchange App',
      },
    ],
  },
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const params = await props.params

  const {locale} = params

  const {children} = props

  const user = await auth()
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie'),
  )

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} `} suppressHydrationWarning>
        <Providers initialState={initialState}>
          <Nav user={user} />
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
