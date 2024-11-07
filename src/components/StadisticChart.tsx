'use client'
import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {getTimeSeriesDailyAdjusted} from '@/services/exchangeRate'
import {Charts} from './Charts'

// ! This component is not used in the app
export const StadisticChart = () => {
  const [symbol, setSymbol] = React.useState('SPY')

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['TimeSeriesDaily', {symbol}],
    queryFn: async () => getTimeSeriesDailyAdjusted(symbol),
  })

  return (
    <>
      <p>Daily Time Series with Splits and Dividend Events</p>
      <h3>Symbol: {data ? data.symbol : ''}</h3>
      <small>Last Refresh: {data ? data.refreshed : ''}</small>
      {!isLoading && <Charts prices={data.prices} />}
    </>
  )
}
