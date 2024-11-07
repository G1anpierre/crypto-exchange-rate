'user server'

import {PriceType} from '@/components/Charts'

const baseURL = 'https://alpha-vantage.p.rapidapi.com'

export const getExchangeRate = async (
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
) => {
  try {
    const response = await fetch(
      `${baseURL}/query?from_currency=${fromCryptoCurrency}&function=CURRENCY_EXCHANGE_RATE&to_currency=${toFiatCurrency}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/octet-stream',
          'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
        },
      },
    )

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}

// This is not being used in the app
// export const getTimeSeriesDailyAdjusted = async (symbol: string) => {
//   try {
//     const response = await fetch(
//       `${baseURL}/query?datatype=json&function=TIME_SERIES_DAILY_ADJUSTED&outputsize=compact&symbol=${symbol}`,
//       {
//         method: 'GET',
//         headers: {
//           'content-type': 'application/octet-stream',
//           'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
//           'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
//         },
//       },
//     )

//     const data = await response.json()

//     if (!data) return

//     const dates = Object.keys(data?.['Time Series (Daily)']).reverse()
//     const symbol = data?.['Meta Data']?.['2. Symbol']
//     const refreshed = data?.['Meta Data']?.['3. Last Refreshed']
//     const prices = dates?.map(date => ({
//       date: date,
//       open: Number(data['Time Series (Daily)'][date]?.['1. open']),
//       high: Number(data['Time Series (Daily)'][date]?.['2. high']),
//       low: Number(data['Time Series (Daily)'][date]?.['3. low']),
//       close: Number(data['Time Series (Daily)'][date]?.['4. close']),
//     }))

//     const dataReturn = {
//       symbol,
//       refreshed,
//       prices,
//     }

//     return dataReturn
//   } catch (error) {
//     if (error instanceof Error) {
//       throw new Error(error.message)
//     } else {
//       throw new Error('An unknown error occurred')
//     }
//   }
// }

type timePeriodType = {
  [key: string]: string
}

const timePeriod: timePeriodType = {
  DIGITAL_CURRENCY_WEEKLY: 'Time Series (Digital Currency Weekly)',
  DIGITAL_CURRENCY_DAILY: 'Time Series (Digital Currency Daily)',
  DIGITAL_CURRENCY_MONTHLY: 'Time Series (Digital Currency Monthly)',
}

export const cryptoStadistics = async (
  market: string = 'CNY',
  symbol: string = 'BTC',
  func: string = 'DIGITAL_CURRENCY_WEEKLY',
): Promise<PriceType[]> => {
  try {
    const response = await fetch(
      `${baseURL}/query?market=${market}&symbol=${symbol}&function=${func}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/octet-stream',
          'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
        },
      },
    )

    const data = await response.json()

    const dates = Object.keys(data?.[timePeriod[func]]).reverse()

    const prices = dates?.map(date => ({
      date: date,
      open: Number(data[timePeriod[func]][date]?.['1. open']),
      high: Number(data[timePeriod[func]][date]?.['2. high']),
      low: Number(data[timePeriod[func]][date]?.['3. low']),
      close: Number(data[timePeriod[func]][date]?.['4. close']),
    }))

    return prices
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}
