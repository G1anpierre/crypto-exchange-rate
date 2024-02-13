import React from 'react'

import Image from 'next/image'
import {CryptoNewType} from '@/services/cryptoCurrencyNews'

type SingleNewTypeProps = {
  singleNew: CryptoNewType
  sourceSearchParam?: string
}

export const New = ({singleNew, sourceSearchParam}: SingleNewTypeProps) => {
  const getPlaceholderImage = (sourceSearchParam?: string) => {
    if (!sourceSearchParam) return ''
    type PlaceholderImageType = {
      [key: string]: string
    }

    const placeholderImage: PlaceholderImageType = {
      cointelegraph: '/cointelegraph-icon.png',
      bsc: '/bsc-news.svg',
      decrypt: '/decrypt-seeklogo.svg',
      coindesk: '/coindesk-logo-hq.png',
      bitcoinist: '/bitcoinist.webp',
      theguardian: '/the-guardian.png',
    }
    return placeholderImage[sourceSearchParam]
  }

  return (
    <article className="flex flex-col">
      <div className="relative w-full">
        <Image
          src={singleNew.thumbnail}
          alt=""
          className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
          width={800}
          height={600}
          onError={event => {
            event.currentTarget.src = getPlaceholderImage(sourceSearchParam)
            event.currentTarget.srcset = getPlaceholderImage(sourceSearchParam)
          }}
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
      </div>
      <div className="max-w-xl">
        <div className="mt-8 flex items-center gap-x-4 text-xs">
          <time dateTime={singleNew.createdAt} className="text-gray-500">
            {new Date(singleNew.createdAt).toLocaleDateString('en', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              timeZone: 'utc',
            })}
          </time>
          <a
            target="_blank"
            href={singleNew.url}
            className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
          >
            {sourceSearchParam}
          </a>
        </div>
        <div className="group relative">
          <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 dark:text-gray-50">
            <a href={singleNew.url} target="_blank">
              <span className="absolute inset-0" />
              {singleNew.title}
            </a>
          </h3>
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-50">
            {singleNew.description}
          </p>
        </div>
        {/* <div className="relative mt-8 flex items-center gap-x-4">
          <img
            src={new.author.imageUrl}
            alt=""
            className="h-10 w-10 rounded-full bg-gray-100"
          />
          <div className="text-sm leading-6">
            <p className="font-semibold text-gray-900">
              <a href={new.author.href}>
                <span className="absolute inset-0" />
                {new.author.name}
              </a>
            </p>
            <p className="text-gray-600">{new.author.role}</p>
          </div>
        </div> */}
      </div>
    </article>
  )
}
