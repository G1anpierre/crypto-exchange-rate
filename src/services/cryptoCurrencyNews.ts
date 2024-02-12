import axios, {AxiosError} from 'axios'
import z from 'zod'

const CryptoNewSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  createdAt: z.string(),
})

const CryptoNewsSchema = z.array(CryptoNewSchema)

export type CryptoNewsType = z.infer<typeof CryptoNewsSchema>
export type CryptoNewType = z.infer<typeof CryptoNewSchema>

const instance = axios.create({
  baseURL: 'https://cryptocurrency-news2.p.rapidapi.com/v1',
  headers: {
    'content-type': 'application/octet-stream',
    'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com',
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
  },
})

export const getCryptoCurrencyNews = async (infoservice: string) => {
  try {
    const response = await instance({
      method: 'GET',
      url: `/${infoservice}`,
    })
    const validateData = CryptoNewsSchema.parse(response.data.data)
    return validateData
  } catch (err) {
    const errors = err as Error | AxiosError
    if (axios.isAxiosError(errors)) {
      throw new Error(errors.response?.data.message)
    } else {
      throw new Error(errors.message)
    }
  }
}
