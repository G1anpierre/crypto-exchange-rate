'use server'

export const CalculateExchangeRate = async (
  prevState: any,
  formData: FormData,
) => {
  const fromCryptoCurrency = formData.get('fromCryptoCurrency')
  const toFiatCurrency = formData.get('toFiatCurrency')

  const exchangeRate = await fetch(
    `https://alpha-vantage.p.rapidapi.com/query?&to_currency=${toFiatCurrency}&function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCryptoCurrency}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY as string,
        'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
      },
      cache: 'no-store',
    },
  )
  const response = await exchangeRate.json()
  return response
}
