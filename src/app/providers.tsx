'use client'

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from 'next-themes'
import {SessionProvider} from 'next-auth/react'
import {useState} from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {State, WagmiProvider} from 'wagmi'
import {getConfig} from '@/config'
import {NextIntlClientProvider} from 'next-intl'
import {Messages} from 'next-intl'
import {FloatingChatWidget} from '@/components/chat/FloatingChatWidget'
import {NuqsAdapter} from 'nuqs/adapters/next/app'
export function Providers({
  children,
  initialState,
  locale,
  messages,
}: {
  children: React.ReactNode
  initialState: State | undefined
  locale: string
  messages: Messages
}) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <HeroUIProvider>
                <NextThemesProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem={false}
                  disableTransitionOnChange
                >
                  {children}
                  <FloatingChatWidget />
                </NextThemesProvider>
              </HeroUIProvider>
            </NuqsAdapter>
          </NextIntlClientProvider>
        </SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} position="left" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
