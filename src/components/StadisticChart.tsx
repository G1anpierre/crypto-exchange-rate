'use client'
import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {getTimeSeriesDailyAdjusted} from '@/services/exchangeRate'
import {Chart} from './Charts'

export const StadisticChart = () => {
  const [symbol, setSymbol] = React.useState('SPY')

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['TimeSeriesDaily', {symbol}],
    queryFn: () => getTimeSeriesDailyAdjusted(symbol),
  })
  if (!isLoading) {
    console.log('data :', data)
  }
  console.log('error :', error)

  return (
    <>
      <p>Daily Time Series with Splits and Dividend Events</p>
      <h3>Symbol: {data ? data.symbol : ''}</h3>
      <small>Last Refresh: {data ? data.refreshed : ''}</small>
      {!isLoading && <Chart prices={data.prices} />}
    </>
  )
}
