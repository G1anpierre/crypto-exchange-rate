import React from 'react'
import {News} from '@/components/News'
import {SelectNews} from '@/components/SelectNews'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {getCryptoCurrencyNews} from '@/services/cryptoCurrencyNews'

type CryptoNewsProps = {
  searchParams: {source?: string}
}

const CrytoNewsPage = async ({searchParams}: CryptoNewsProps) => {
  const source = searchParams?.source ?? 'coindesk'
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['cryptoNews', {source}],
    queryFn: () => getCryptoCurrencyNews(source),
  })

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SelectNews sourceSearchParam={source} />
        <News sourceSearchParam={source} />
      </HydrationBoundary>
    </div>
  )
}

export default CrytoNewsPage
