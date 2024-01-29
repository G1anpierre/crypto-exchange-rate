import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {Providers} from '../providers'
import {Nav} from '@/components/Nav'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Crypto Exchange App',
  description: 'Get the latest crypto exchange rates',
}

export default function RootLayout({
  children,
  params: {locale},
}: {
  children: React.ReactNode
  params: {locale: string}
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} `} suppressHydrationWarning>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
