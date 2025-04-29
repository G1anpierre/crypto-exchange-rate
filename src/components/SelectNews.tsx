"use client"

import React from 'react'
import classNames from 'classnames'
import {newsSources} from '@/static'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/navigation'
import {Tooltip} from "@heroui/tooltip";
import { useQueryClient } from '@tanstack/react-query'
import { getCryptoCurrencyNews } from '@/services/cryptoCurrencyNews'

export const SelectNews = ({
  sourceSearchParam,
}: {
  sourceSearchParam: string
}) => {
  const t = useTranslations('Compass')
  const queryClient = useQueryClient();

  const getSelectedStyles = (source: string) => {
    return classNames(
      'relative p-8 sm:p-10 hover:bg-secondary flex items-center justify-center w-full h-full transition-all duration-300 ease-in-out transform hover:scale-105 rounded-2xl',
      {
        'bg-primary': sourceSearchParam === source,
        'bg-gray-400/5': sourceSearchParam !== source,
      },
    )
  }

  const handlePrefetch = (source: string) => {
    queryClient.prefetchQuery({
      queryKey: ['cryptoNews', {source}],
      queryFn: async () => getCryptoCurrencyNews(source),
    })
  }

  return (
    <div className="bg-white py-24 dark:bg-black sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {/* Stay Ahead of the Curve: Curated Crypto News by Platform */}
              {t('title')}
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-lg leading-8 text-gray-600 dark:text-white">
              <p className="font-bold">{t('description-1')}</p>

              <p>{t('description-2')}</p>

              <p>{t('description-3')}</p>

              <p className="font-bold">{t('description-4')}</p>
            </div>
          </div>
          <div className="-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3">
            {newsSources.map(newsSource => (
              <Link
                key={newsSource.id}
                href={`/?source=${newsSource.searchParams}#news-title`}
                className={getSelectedStyles(newsSource.searchParams)}
                prefetch={false}
                onMouseEnter={() => {
                  handlePrefetch(newsSource.searchParams)
                }}
              >
                <Tooltip
                  content={newsSource.name}
                  placement="top"
                  className="bg-primary text-white"
                  >

                <img
                  className={`${
                    newsSource.name === 'Decrypt' ? 'max-h-14' : 'max-h-14'
                  } h-full w-full object-contain align-middle`}
                  src={newsSource.imageUrl}
                  alt={newsSource.name}
                  width={105}
                  height={48}
                  />
                  </Tooltip>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
