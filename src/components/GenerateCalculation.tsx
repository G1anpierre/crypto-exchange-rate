'use client'
import React from 'react'
import {Button} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'

type GenerateCalculationProps = {
  fromCryptoCurrency: string
  toFiatCurrency: string
}

export const GenerateCalculation = ({
  fromCryptoCurrency,
  toFiatCurrency,
}: GenerateCalculationProps) => {
  const queryClient = useQueryClient()

  const recalculate = () => {
    queryClient.invalidateQueries({
      queryKey: ['exchangeRate', {fromCryptoCurrency, toFiatCurrency}],
    })
  }

  return (
    <Button
      color="primary"
      type="button"
      className="col-span-2"
      onClick={recalculate}
    >
      <div className="flex align-center gap-3">
        <span className="relative inline-block ">Refresh !</span>
      </div>
    </Button>
  )
}
