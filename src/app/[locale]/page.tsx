

import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {SelectNews} from '@/components/SelectNews'
import {News} from '@/components/News'
import {DEFAULT_NEWS_PLARFORM} from '@/static'
import {getCryptoCurrencyNews} from '@/services/cryptoCurrencyNews'

type CryptoNewsProps = {
  searchParams: Promise<{source?: string}>
}

export default async function Home(props: CryptoNewsProps) {

  const searchParams = await props.searchParams;
    const source = searchParams?.source ?? DEFAULT_NEWS_PLARFORM
    const queryClient = new QueryClient()
  
    await queryClient.prefetchQuery({
      queryKey: ['cryptoNews', {source}],
      queryFn: async () => await getCryptoCurrencyNews(source),
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
