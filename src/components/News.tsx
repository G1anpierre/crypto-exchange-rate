'use client'

import React from 'react'
import {getCryptoCurrencyNews} from '@/services/cryptoCurrencyNews'
import {newsSources} from '@/static'
import {useQuery} from '@tanstack/react-query'
import {New} from './New'
import {SkeletonCardNew} from './SkeletonCardNew'

export const News = ({sourceSearchParam}: {sourceSearchParam: string}) => {
  const title = newsSources.find(
    source => source.searchParams === sourceSearchParam,
  )

  // TODO: Add Lazy Loading and Infinite Queries TanksTack
  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['cryptoNews', {source: sourceSearchParam}],
    queryFn: async () => getCryptoCurrencyNews(sourceSearchParam),
  })

  const skeletonCards = new Array(6).fill(0)

  if (isError) console.log('News Error:', error?.message)

  return (
    <div className="bg-white pb-12 dark:bg-black sm:pb-28" id="news-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {title?.name}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-800 dark:text-white">
            Get the top latest news.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {isError ? (
            <div className="col-span-3 text-center text-red-500">
              At the moment {sourceSearchParam.toUpperCase()} is not available, We are sorry for the inconvenience.
            </div>
          ) : isLoading ? (
            <>
              {skeletonCards.map((_, index) => (
                <SkeletonCardNew key={index} />
              ))}
            </>
          ) : (
            data?.map(newItem => (
              <New
                key={newItem.url}
                singleNew={newItem}
                sourceSearchParam={title?.name}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
