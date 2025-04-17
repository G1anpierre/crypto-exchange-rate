"use server"

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
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {routing} from '@/i18n/routing'

const inter = Inter({subsets: ['latin']})

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const params = await props.params

  const {locale} = params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const {children} = props

  const user = await auth()
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie'),
  )

  return (
    <html lang={locale}>
      <body className={`${inter.className} `}>
        <Providers initialState={initialState} locale={locale}>
          <Nav user={user} />
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
