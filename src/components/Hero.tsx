import React from 'react'
import CryptoExchange from './CryptoExchange'
import {getTranslations} from 'next-intl/server'
import Image from 'next/image'


export const Hero = async () => {
  const t = await getTranslations('Index')
  return (
    <div className="relative isolate mx-auto overflow-hidden bg-white dark:bg-black">
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
        />
      </svg>
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-24 pt-10 sm:pb-32 lg:flex-row lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <Image
            className="h-11"
            src="/cryptocurrency.png"
            alt="Crypto Exchange App"
            width={40}
            height={10}
          />

          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {t('title')}
          </h1>
          <p className="dark:text-white-600 mt-6 text-lg leading-8 text-gray-800">
            {t('description')}
          </p>
        </div>
        <div className=" m-auto h-full w-full">
          <div className="h-full w-full">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <CryptoExchange />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
