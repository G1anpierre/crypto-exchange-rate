import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {Providers} from '../providers'
import {Nav} from '@/components/Nav'
import {Footer} from '@/components/Footer'
import {Toaster} from '@/components/ui/toaster'
import {auth} from '@/auth'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Crypto Exchange App',
  description: 'Get the latest crypto exchange rates',
}

export default async function RootLayout({
  children,
  params: {locale},
}: {
  children: React.ReactNode
  params: {locale: string}
}) {
  const user = await auth()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} `} suppressHydrationWarning>
        <Providers>
          <Nav user={user} />
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
