'use server'

type InitialStateType = {
  message: string
}

export const CalculateExchangeRate = async (
  prevState: InitialStateType,
  formData: FormData,
) => {
  const fromCryptoCurrency = formData.get('fromCryptoCurrency')
  const toFiatCurrency = formData.get('toFiatCurrency')

  try {
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
  } catch (e) {
    console.error(e)
    return {message: 'Something went wrong', error: true}
  }
}
