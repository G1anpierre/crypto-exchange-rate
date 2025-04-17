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

export function Providers({
  children,
  initialState,
  locale,
}: {
  children: React.ReactNode
  initialState: State | undefined
  locale: string
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
          <NextIntlClientProvider locale={locale}>
            <HeroUIProvider>
              <NextThemesProvider attribute="class" defaultTheme="dark">
                {children}
              </NextThemesProvider>
            </HeroUIProvider>
          </NextIntlClientProvider>
        </SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
