'use server'
import {request} from 'undici'
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
    const { body } = await request(
      `https://alpha-vantage.p.rapidapi.com/query?&to_currency=${toFiatCurrency}&function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCryptoCurrency}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY as string,
          'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
        },
      },
    )

    const response = await body.json()
    return response
  } catch (e) {
    console.error(e)
    return {message: 'Something went wrong', error: true}
  }
}
