import axios, {AxiosError} from 'axios'

export const getExchangeRate = async (
  fromCryptoCurrency = 'BTC',
  toFiatCurrency = 'USD',
) => {
  const options = {
    method: 'GET',
    url: 'https://alpha-vantage.p.rapidapi.com/query',
    params: {
      from_currency: fromCryptoCurrency,
      function: 'CURRENCY_EXCHANGE_RATE',
      to_currency: toFiatCurrency,
    },
    headers: {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
      'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
    },
  }

  try {
    const response = await axios(options)
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
