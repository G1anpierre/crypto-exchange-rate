import axios, {AxiosError} from 'axios'

const instance = axios.create({
  baseURL: 'https://alpha-vantage.p.rapidapi.com',
  headers: {
    'content-type': 'application/octet-stream',
    'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
  },
})

export const getExchangeRate = async (
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
) => {
  try {
    const response = await instance({
      method: 'GET',
      url: '/query',
      params: {
        from_currency: fromCryptoCurrency,
        function: 'CURRENCY_EXCHANGE_RATE',
        to_currency: toFiatCurrency,
      },
    })
    return response.data
  } catch (err) {
    const errors = err as Error | AxiosError
    if (axios.isAxiosError(errors)) {
      throw new Error(errors.response?.data.message)
    } else {
      throw new Error(errors.message)
    }
  }
}

export const getTimeSeriesDailyAdjusted = async (symbol: string) => {
  try {
    const response = await instance({
      method: 'GET',
      url: '/query',
      params: {
        outputsize: 'compact',
        datatype: 'json',
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol.toUpperCase(),
      },
      transformResponse: [
        function (data) {
          if (!data) return
          const json = JSON.parse(data)
          const dates = Object.keys(json?.['Time Series (Daily)']).reverse()
          const symbol = json?.['Meta Data']?.['2. Symbol']
          const refreshed = json?.['Meta Data']?.['3. Last Refreshed']
          const prices = dates?.map(date => ({
            date: date,
            open: Number(json['Time Series (Daily)'][date]?.['1. open']),
            high: Number(json['Time Series (Daily)'][date]?.['2. high']),
            low: Number(json['Time Series (Daily)'][date]?.['3. low']),
            close: Number(json['Time Series (Daily)'][date]?.['4. close']),
          }))

          const dataReturn = {
            symbol,
            refreshed,
            prices,
          }
          return dataReturn
        },
      ],
    })
    return response.data
  } catch (err) {
    const errors = err as Error | AxiosError
    if (axios.isAxiosError(errors)) {
      throw new Error(errors.response?.data.message)
    } else {
      throw new Error(errors.message)
    }
  }
}

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
) => {
  try {
    const response = await instance({
      method: 'GET',
      url: '/query',
      params: {
        market,
        symbol,
        function: func,
      },
      transformResponse: [
        function (data) {
          if (!data) return
          const json = JSON.parse(data)
          const dates = Object.keys(json?.[timePeriod[func]]).reverse()
          const prices = dates?.map(date => ({
            date: date,
            open: Number(json[timePeriod[func]][date]?.['1. open']),
            high: Number(json[timePeriod[func]][date]?.['2. high']),
            low: Number(json[timePeriod[func]][date]?.['3. low']),
            close: Number(json[timePeriod[func]][date]?.['4. close']),
          }))

          const dataReturn = {
            prices,
          }
          return dataReturn
        },
      ],
    })
    return response.data
  } catch (err) {
    const errors = err as Error | AxiosError
    console.error(errors)
    if (axios.isAxiosError(errors)) {
      throw new Error(errors.response?.data.message)
    } else {
      throw new Error(errors.message)
    }
  }
}
