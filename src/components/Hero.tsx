import React from 'react'
import CryptoExchange from './CryptoExchange'
// import {useTranslations} from 'next-intl'
import {getTranslations} from 'next-intl/server'
export const Hero = async () => {
  const t = await getTranslations('Index')
  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-black">
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
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 flex flex-col gap-10 lg:flex-row lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <img
            className="h-11"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />

          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-white-600">
            {t('description')}
          </p>
        </div>
        <div className=" w-full h-full m-auto">
          <div className="w-full h-full">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <CryptoExchange />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
