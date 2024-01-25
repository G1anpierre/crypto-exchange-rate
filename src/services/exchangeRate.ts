import axios from 'axios'

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

  return axios
    .request(options)
    .then(res => {
      return res.data
    })
    .catch(err => {
      return err
    })
}
