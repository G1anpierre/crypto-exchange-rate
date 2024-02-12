import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import {newsSources} from '@/static'

export const SelectNews = ({
  sourceSearchParam,
}: {
  sourceSearchParam: string
}) => {
  const getSelectedStyles = (source: string) => {
    return classNames(
      'relative p-8 sm:p-10 hover:bg-secondary flex items-center justify-center w-full h-full transition-all duration-300 ease-in-out transform hover:scale-105 rounded-2xl',
      {
        'bg-primary': sourceSearchParam === source,
        'bg-gray-400/5': sourceSearchParam !== source,
      },
    )
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Stay Ahead of the Curve: Curated Crypto News by Platform
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 flex flex-col gap-4">
              <p className="font-bold">
                Get the latest crypto news from your favorite sources, all in
                one place!
              </p>

              <p>
                With our &quot;Your Crypto Compass&quot; section, you can easily
                curate your crypto news feed by selecting from top platforms
                like CoinDesk, Bitcoinist, Cointelegraph, Decrypt, BSC News, and
                even The Guardian for more mainstream financial insights.
              </p>

              <p>
                <span className="font-bold">
                  No more hopping between apps or websites:
                </span>{' '}
                Just choose your desired platform and get instant access to the
                latest headlines, analysis, and updates.
              </p>

              <p className="font-bold">
                Stay informed and make smarter investment decisions by staying
                ahead of the curve with &quot;Your Crypto Compass.&quot;
              </p>
            </p>
            {/* <div className="mt-8 flex items-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create account
              </a>
              <a href="#" className="text-sm font-semibold text-gray-900">
                Contact us <span aria-hidden="true">&rarr;</span>
              </a>
            </div> */}
          </div>
          <div className="-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3">
            {newsSources.map(newsSource => (
              <Link
                key={newsSource.id}
                href={`/cryptonews?source=${newsSource.searchParams}`}
                className={getSelectedStyles(newsSource.searchParams)}
              >
                <img
                  className={`${
                    newsSource.name === 'Decrypt' ? 'max-h-14' : 'max-h-14'
                  } w-full object-contain align-middle h-full`}
                  src={newsSource.imageUrl}
                  alt={newsSource.name}
                  width={105}
                  height={48}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
