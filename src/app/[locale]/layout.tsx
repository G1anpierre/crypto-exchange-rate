
import {Inter} from 'next/font/google'
import './globals.css'
import {Providers} from '../providers'
import {Nav} from '@/components/Nav'
import {Footer} from '@/components/Footer'
import {Toaster} from '@/components/ui/toaster'
import {auth} from '@/auth'
import {cookies} from 'next/headers'
import {cookieToInitialState} from 'wagmi'
import {getConfig} from '@/config'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {routing} from '@/i18n/routing'
import {getMessages} from 'next-intl/server'

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

  // Reconstruct cookie header from Next.js cookies API to avoid URL-encoding issues
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')
  const initialState = cookieToInitialState(getConfig(), cookieHeader || null)

  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.className} `}>
        <Providers initialState={initialState} locale={locale} messages={messages}>
          <Nav user={user} />
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
