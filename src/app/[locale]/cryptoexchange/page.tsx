'use server'

import React from 'react'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {CryptoChart} from '@/components/CryptoChart'
import {Hero} from '@/components/Hero'
import {getTranslations} from 'next-intl/server'
import {cryptoStadistics} from '@/services/ccxt/historicalData'
import {auth} from '@/auth'
import { redirect } from 'next/navigation'


const CryptoNewsPage = async () => {
  const user = await auth()

  if(!user || !user.user) {
   redirect('/login')
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [
      'cryptoStadistics',
      {func: 'DIGITAL_CURRENCY_MONTHLY', market: 'EUR', symbol: 'BTC'},
    ],
    queryFn: async () =>
      cryptoStadistics('EUR', 'BTC', 'DIGITAL_CURRENCY_MONTHLY'),
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

export default CryptoNewsPage
