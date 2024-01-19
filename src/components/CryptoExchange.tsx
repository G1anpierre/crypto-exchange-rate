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
} from '@nextui-org/react'
import {GenerateCalculation} from './GenerateCalculation'
import {CalculateExchangeRate} from '@/actions/calculateExchange'
import {useFormState} from 'react-dom'
import {cryptocurrencies, fiatCurrencies} from '@/static'

export default function CryptoExchange() {
  const initialState = {
    message: '',
  }
  const [state, formAction] = useFormState(CalculateExchangeRate, initialState)

  let exchangeRate: null | string = null
  const RealTimeExchangeRate = state['Realtime Currency Exchange Rate']
  if (RealTimeExchangeRate) {
    exchangeRate = Number(RealTimeExchangeRate['5. Exchange Rate']).toFixed(2)
  }

  return (
    <Card>
      <form action={formAction}>
        <CardHeader className="grid grid-cols-2 grid-rows-2 gap-2">
          <Select
            label="Cryptocurrency"
            placeholder="Select a cryptocurrency"
            // startContent={<Image src="/bitcoin.svg" width={20} height={20} />}
            defaultSelectedKeys={['BTC']}
            className="max-w-xs"
            name="fromCryptoCurrency"
            color="primary"
          >
            {cryptocurrencies.map(cryptocurrency => (
              <SelectItem
                key={cryptocurrency.value}
                value={cryptocurrency.value}
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
            className="max-w-xs"
            name="toFiatCurrency"
            color="primary"
          >
            {fiatCurrencies.map(fiatCurrency => (
              <SelectItem key={fiatCurrency.value} value={fiatCurrency.value}>
                {fiatCurrency.label}
              </SelectItem>
            ))}
          </Select>
          <GenerateCalculation />
        </CardHeader>
      </form>

      <Divider />
      <CardBody className="min-h-20">
        <div>
          <p className="text-center">Live Exchange Rate</p>
          <div className="text-center">{exchangeRate}</div>
        </div>
        {state?.message && (
          <p className="text-red-700 text-sm min-h-8">{state.message}</p>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        <div className="flex justify-center w-full">
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
