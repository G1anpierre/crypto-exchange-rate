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

// Updated to use RSS feeds via API route (server-side to avoid CORS)
export const getCryptoCurrencyNews = async (infoservice: string) => {
  try {
    // Fetch news from API route (server-side, no CORS issues)
    const response = await fetch(`/api/news?source=${infoservice}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`)
    }

    const data = await response.json()

    // Validate the data with existing schema for backward compatibility
    const validateData = CryptoNewsSchema.parse(data)

    return validateData
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}
