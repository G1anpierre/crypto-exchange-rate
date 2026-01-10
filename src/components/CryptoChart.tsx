'use client'

import React from 'react'
import {useQuery, useSuspenseQuery} from '@tanstack/react-query'
import {cryptoStadistics} from '@/services/ccxt/historicalData'
import {Charts} from './Charts'
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  CardHeader,
  Skeleton,
} from '@heroui/react'
import {cryptocurrencies, dataKeys, fiatCurrencies, timePeriods} from '@/static'
import {useQueryState, parseAsString} from 'nuqs'

export const CryptoChart = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  const [market, setMarket] = useQueryState(
    'market',
    parseAsString.withDefault('EUR').withOptions({shallow: true}),
  )
  const [symbol, setSymbol] = useQueryState(
    'symbol',
    parseAsString.withDefault('BTC').withOptions({shallow: true}),
  )
  const [func, setFunct] = useQueryState(
    'func',
    parseAsString
      .withDefault('DIGITAL_CURRENCY_MONTHLY')
      .withOptions({shallow: true}),
  )

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['cryptoStadistics', {symbol, market, func}],
    queryFn: () => cryptoStadistics(market, symbol, func, 'kraken'),
    retry: 1, // Retry once if it fails
  })

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10">
      <div className="">
        <h2 className="px-4 text-4xl font-bold dark:text-white">{title}</h2>
        <p className="dark:text-white-600 px-4 text-lg leading-8 text-gray-800">
          {description}
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row">
          <Select
            label="Market"
            placeholder="Select market"
            color="primary"
            selectedKeys={[market]}
            onChange={e => setMarket(e.target.value)}
          >
            {fiatCurrencies.map(fiatCurrency => (
              <SelectItem key={fiatCurrency.value}>
                {fiatCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Symbol"
            placeholder="Select symbol"
            color="primary"
            selectedKeys={[symbol]}
            onChange={e => setSymbol(e.target.value)}
          >
            {cryptocurrencies.map(cryptoCurrency => (
              <SelectItem key={cryptoCurrency.value}>
                {cryptoCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Time period"
            placeholder="Select Time Period"
            color="primary"
            selectedKeys={[func]}
            onChange={e => setFunct(e.target.value)}
          >
            {timePeriods.map(timePeriod => (
              <SelectItem key={timePeriod.value}>{timePeriod.label}</SelectItem>
            ))}
          </Select>
        </CardHeader>
        <CardBody className="min-h-20">
          {isError ? (
            <p className="min-h-8 text-center text-sm text-red-700">
              {error?.message ||
                'Failed to fetch historical data. Please try again.'}
            </p>
          ) : isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="rounded-lg">
                <div className="h-96 rounded-lg bg-default-300"></div>
              </Skeleton>
              {dataKeys.map(dataKey => (
                <Skeleton className="rounded-lg" key={dataKey.type}>
                  <div className="h-48 rounded-lg bg-default-300"></div>
                </Skeleton>
              ))}
            </div>
          ) : (
            <Charts prices={data} dataKeys={dataKeys} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
