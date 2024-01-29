'use client'

import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {cryptoStadistics} from '@/services/exchangeRate'
import {Charts} from './Charts'
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  CardHeader,
  Skeleton,
} from '@nextui-org/react'
import {cryptocurrencies, dataKeys, fiatCurrencies, timePeriods} from '@/static'

export const CryptoChart = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  const [market, setMarket] = React.useState('EUR')
  const [symbol, setSymbol] = React.useState('BTC')
  const [func, setFunct] = React.useState('DIGITAL_CURRENCY_MONTHLY')

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['cryptoStadistics', {symbol, market, func}],
    queryFn: () => cryptoStadistics(market, symbol, func),
  })

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10">
      <div className="">
        <h2 className="text-4xl font-bold px-4 dark:text-white">{title}</h2>
        <p className="text-lg leading-8 px-4 text-gray-600 dark:text-white-600">
          {description}
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row">
          <Select
            label="Market"
            variant="bordered"
            placeholder="Select market"
            color="primary"
            selectedKeys={[market]}
            onChange={e => setMarket(e.target.value)}
          >
            {fiatCurrencies.map(fiatCurrency => (
              <SelectItem key={fiatCurrency.value} value={fiatCurrency.value}>
                {fiatCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Symbol"
            variant="bordered"
            placeholder="Select symbol"
            color="primary"
            selectedKeys={[symbol]}
            onChange={e => setSymbol(e.target.value)}
          >
            {cryptocurrencies.map(cryptoCurrency => (
              <SelectItem
                key={cryptoCurrency.value}
                value={cryptoCurrency.value}
              >
                {cryptoCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Time period"
            variant="bordered"
            placeholder="Select Time Period"
            color="primary"
            selectedKeys={[func]}
            onChange={e => setFunct(e.target.value)}
          >
            {timePeriods.map(timePeriod => (
              <SelectItem key={timePeriod.value} value={timePeriod.value}>
                {timePeriod.label}
              </SelectItem>
            ))}
          </Select>
        </CardHeader>
        <CardBody className="min-h-20">
          {isError ? (
            <p className="text-red-700 text-sm min-h-8 text-center">
              {error?.message}
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
            <Charts prices={data.prices} dataKeys={dataKeys} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
