import {CryptoChart} from '@/components/CryptoChart'
import {Hero} from '@/components/Hero'
import {StadisticChart} from '@/components/StadisticChart'
import {getTranslations} from 'next-intl/server'

import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {cryptoStadistics} from '@/services/exchangeRate'

export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [
      'cryptoStadistics',
      {func: 'DIGITAL_CURRENCY_MONTHLY', market: 'EUR', symbol: 'BTC'},
    ],
    queryFn: () => cryptoStadistics('EUR', 'BTC', 'DIGITAL_CURRENCY_MONTHLY'),
  })

  const t = await getTranslations('Stadistics')
  return (
    <main className="flex min-h-screen flex-col">
      <div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Hero />
          {/* <StadisticChart /> */}
          <CryptoChart title={t('title')} description={t('description')} />
        </HydrationBoundary>
      </div>
    </main>
  )
}
