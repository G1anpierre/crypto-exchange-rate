import React from 'react'
import {News} from '@/components/News'
import {SelectNews} from '@/components/SelectNews'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {getCryptoCurrencyNews} from '@/services/cryptoCurrencyNews'
import {DEFAULT_NEWS_PLARFORM} from '@/static'

type CryptoNewsProps = {
  searchParams: Promise<{source?: string}>
}

const CrytoNewsPage = async (props: CryptoNewsProps) => {
  const searchParams = await props.searchParams;
  const source = searchParams?.source ?? DEFAULT_NEWS_PLARFORM
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
