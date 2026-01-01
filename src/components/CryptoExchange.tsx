'use client'

import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react"
import {GenerateCalculation} from './GenerateCalculation'
import {cryptocurrencies, fiatCurrencies} from '@/static'
import {useQuery} from '@tanstack/react-query'
import {getExchangeRate} from '@/services/ccxt/exchangeRate'
import classNames from 'classnames'
import {transform} from '@/utils'
import {useQueryState, parseAsString} from 'nuqs'

export default function CryptoExchange() {
  const [fromCryptoCurrency, setFromCryptoCurrency] = useQueryState(
    'crypto',
    parseAsString.withDefault('BTC').withOptions({ shallow: true }),
  )
  const [toFiatCurrency, setToFiatCurrency] = useQueryState(
    'currency',
    parseAsString.withDefault('USD').withOptions({ shallow: true }),
  )

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['exchangeRate', {fromCryptoCurrency, toFiatCurrency}],
    queryFn: () => getExchangeRate(fromCryptoCurrency, toFiatCurrency, 'kraken'),
    retry: 1,  // Retry once if it fails
    // refetchInterval: 30000,
  })

  // CCXT returns the price directly in the 'price' field
  const exchangeRate = data?.price

  const handleCryptocurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFromCryptoCurrency(event.target.value)
  }

  const handleFiatCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setToFiatCurrency(event.target.value)
  }

  const liveExchangeRateClass = classNames(
    'absolute -left-3 top-0 block h-2.5 w-2.5 -translate-y-1/2 transform rounded-full',
    {
      'bg-green-400': !isLoading && !isError,
      'bg-red-400': isError,
      'bg-orange-400': isLoading && !isError,
    },
  )

  const transformedRate = exchangeRate ? transform(exchangeRate, toFiatCurrency) : null

  return (
    <Card>
      <form>
        <CardHeader className="grid grid-cols-2 grid-rows-2 gap-2">
          <Select
            label="Cryptocurrency"
            placeholder="Select a cryptocurrency"
            // startContent={<Image src="/bitcoin.svg" width={20} height={20} />}
            defaultSelectedKeys={['BTC']}
            name="fromCryptoCurrency"
            color="primary"
            selectedKeys={[fromCryptoCurrency]}
            onChange={handleCryptocurrencyChange}
          >
            {cryptocurrencies.map(cryptocurrency => (
              <SelectItem
                key={cryptocurrency.value}
              >
                {cryptocurrency.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="FiatCurrency"
            placeholder="Select a fiatCurrency"
            // startContent={<Image src="/bitcoin.svg" width={20} height={20} />}
            defaultSelectedKeys={['USD']}
            name="toFiatCurrency"
            color="primary"
            selectedKeys={[toFiatCurrency]}
            onChange={handleFiatCurrencyChange}
          >
            {fiatCurrencies.map(fiatCurrency => (
              <SelectItem key={fiatCurrency.value}>
                {fiatCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <GenerateCalculation
            fromCryptoCurrency={fromCryptoCurrency}
            toFiatCurrency={toFiatCurrency}
          />
        </CardHeader>
      </form>

      <Divider />
      <CardBody className="min-h-20">
        <div className="mx-auto">
          <div className="relative inline-block">
            Live Exchange Rate
            <span className={liveExchangeRateClass} />
          </div>
          <div className="text-center text-2xl">
            {isLoading ? (
              <Spinner color="warning" labelColor="warning" size="sm" />
            ) : (
              <span className="text-success">{transformedRate}</span>
            )}
          </div>
        </div>
        {isError && (
          <p className="min-h-8 text-center text-sm text-red-700">
            {error.message}
          </p>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        <div className="flex w-full justify-center">
          <Link
            isExternal
            showAnchorIcon
            href="https://github.com/G1anpierre/crypto-exchange-rate"
          >
            Visit source code on GitHub.
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
