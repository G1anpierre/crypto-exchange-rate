
import z from 'zod'

const CryptoNewSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string().or(z.object({})),
  thumbnail: z.string().optional(),
  createdAt: z.string(),
})

const CryptoNewsSchema = z.array(CryptoNewSchema)

export type CryptoNewsType = z.infer<typeof CryptoNewsSchema>
export type CryptoNewType = z.infer<typeof CryptoNewSchema>

const baseURL = 'https://cryptocurrency-news2.p.rapidapi.com/v1'


// const instance = axios.create({
//   baseURL: 'https://cryptocurrency-news2.p.rapidapi.com/v1',
//   headers: {
//     'content-type': 'application/octet-stream',
//     'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com',
//     'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
//   },
// })

export const getCryptoCurrencyNews = async (infoservice: string) => {
  try {
    const response = await fetch(`${baseURL}/${infoservice}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com',
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY as string,
      },
    })

    const data = await response.json()

    const validateData = CryptoNewsSchema.parse(data.data)

    return validateData
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}
