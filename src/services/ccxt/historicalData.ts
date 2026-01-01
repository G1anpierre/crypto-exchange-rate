'use server'

import ccxt from 'ccxt'
import { PriceType } from '@/components/Charts'

/**
 * CCXT Historical Data Service
 *
 * Replacement for Alpha Vantage cryptoStadistics
 * Provides OHLCV (Open, High, Low, Close, Volume) historical data
 */

export type TimeframeType = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

/**
 * Mapping from Alpha Vantage function names to CCXT timeframes
 */
const TIMEFRAME_MAP: Record<string, TimeframeType> = {
  'DIGITAL_CURRENCY_DAILY': '1d',
  'DIGITAL_CURRENCY_WEEKLY': '1w',
  'DIGITAL_CURRENCY_MONTHLY': '1M',
}

/**
 * Convert standard timeframe to Kraken-specific format
 * Kraken uses minutes as numbers instead of standard string format
 */
function getKrakenTimeframe(timeframe: TimeframeType): number {
  const krakenTimeframes: Record<TimeframeType, number> = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440,
    '1w': 10080,
    '1M': 10080,  // Use weekly for monthly (Kraken doesn't support monthly)
  }
  return krakenTimeframes[timeframe] || 1440
}

/**
 * Adjust data point limit when using fallback timeframes
 * When monthly is requested but we use weekly, we need more data points
 */
function getKrakenLimit(requestedTimeframe: TimeframeType, baseLimit: number): number {
  // If user requested monthly but we're using weekly, fetch 4x more data
  if (requestedTimeframe === '1M') {
    return Math.min(baseLimit * 4, 720) // Kraken max is 720
  }
  return baseLimit
}

/**
 * Get historical cryptocurrency price data (OHLCV)
 * Always uses Kraken exchange for reliability and no geo-restrictions
 *
 * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param market - Market currency (e.g., 'USD', 'EUR', 'GBP')
 * @param timeframe - Timeframe for candles ('1d', '1w', '1M', etc.)
 * @param limit - Number of data points to fetch (default: 100)
 * @param exchangeName - Kept for backward compatibility (always uses Kraken)
 * @returns Array of price data compatible with your Charts component
 */
export async function getCryptoHistoricalData(
  symbol: string = 'BTC',
  market: string = 'USD',
  timeframe: TimeframeType = '1d',
  limit: number = 100,
  exchangeName: string = 'kraken'  // Always use Kraken
): Promise<PriceType[]> {
  // Always use Kraken - no geo-restrictions, reliable, no API key needed
  const exchange = new ccxt.kraken({
    enableRateLimit: true,
    timeout: 8000,
  })

  // Convert to Kraken timeframe format and adjust limit if needed
  const krakenTimeframe = getKrakenTimeframe(timeframe)
  const adjustedLimit = getKrakenLimit(timeframe, limit)

  const symbolUpper = symbol.toUpperCase()
  const requestedMarket = market.toUpperCase()

  // Kraken supports real fiat currencies (USD, EUR, GBP, etc.)
  // Define fallback order based on requested currency
  const fallbackCurrencies = [requestedMarket]

  // Add fallbacks if original currency likely won't work
  if (!['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'CHF', 'AUD'].includes(requestedMarket)) {
    fallbackCurrencies.push('USD', 'EUR')
  }

  let ohlcv
  const attemptedPairs: string[] = []

  // Try each currency in fallback order
  for (const currency of fallbackCurrencies) {
    const pair = `${symbolUpper}/${currency}`
    attemptedPairs.push(pair)

    try {
      ohlcv = await exchange.fetchOHLCV(pair, krakenTimeframe as any, undefined, adjustedLimit)
      if (ohlcv && ohlcv.length > 0) {
        break // Success! Exit the loop
      }
    } catch (error) {
      // If this is the last fallback, throw error
      if (currency === fallbackCurrencies[fallbackCurrencies.length - 1]) {
        const triedPairs = attemptedPairs.join(', ')
        if (error instanceof Error) {
          throw new Error(
            `Failed to fetch historical data for ${symbol}/${market}. ` +
            `Tried: ${triedPairs}. Error: ${error.message}`
          )
        }
        throw new Error(`Failed to fetch historical data. Tried: ${triedPairs}`)
      }
      // Otherwise, continue to next fallback
    }
  }

  if (!ohlcv || ohlcv.length === 0) {
    throw new Error(`Failed to fetch historical data for ${symbol}/${market}`)
  }

  // Transform to PriceType format (compatible with your existing Charts)
  const prices: PriceType[] = ohlcv.map((candle) => ({
    date: new Date(Number(candle[0])).toISOString().split('T')[0], // Format: YYYY-MM-DD
    open: Number(candle[1]),
    high: Number(candle[2]),
    low: Number(candle[3]),
    close: Number(candle[4]),
  }))

  return prices
}

/**
 * Wrapper function compatible with existing cryptoStadistics signature
 * This makes migration easier - same function signature as Alpha Vantage version
 * Always uses Kraken exchange
 *
 * @param market - Market currency (e.g., 'USD', 'EUR', 'GBP')
 * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param func - Function type (maps to timeframe)
 * @param exchangeName - Kept for backward compatibility (always uses Kraken)
 * @returns Array of price data
 */
export async function cryptoStadistics(
  market: string = 'USD',
  symbol: string = 'BTC',
  func: string = 'DIGITAL_CURRENCY_WEEKLY',
  exchangeName: string = 'kraken'  // Always use Kraken
): Promise<PriceType[]> {
  // Map Alpha Vantage function name to CCXT timeframe
  const timeframe = TIMEFRAME_MAP[func] || '1w'

  // Determine limit based on timeframe
  // For monthly, we use weekly on Kraken (handled by getKrakenLimit)
  const limitMap: Record<TimeframeType, number> = {
    '1m': 60,   // Last hour
    '5m': 288,  // Last day
    '15m': 672, // Last week
    '30m': 336, // Last week
    '1h': 168,  // Last week
    '4h': 180,  // Last month
    '1d': 90,   // Last 3 months
    '1w': 52,   // Last year
    '1M': 48,   // Last ~1 year (uses weekly data, adjusted by getKrakenLimit)
  }

  const limit = limitMap[timeframe] || 100

  // Always use Kraken
  return getCryptoHistoricalData(symbol, market, timeframe, limit, 'kraken')
}

/**
 * Get real-time candlestick data (useful for live charts)
 *
 * @param symbol - Cryptocurrency symbol
 * @param market - Market currency
 * @param timeframe - Timeframe for candles
 * @param limit - Number of candles
 * @returns Recent OHLCV data with volume
 */
export async function getRealtimeCandles(
  symbol: string,
  market: string,
  timeframe: TimeframeType = '1m',
  limit: number = 60
) {
  // Configuration with optional API keys for higher rate limits
  const config: any = { enableRateLimit: true }

  // Add Binance API keys if available
  if (process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET) {
    config.apiKey = process.env.BINANCE_API_KEY
    config.secret = process.env.BINANCE_API_SECRET
  }

  const exchange = new ccxt.binance(config)
  const pair = `${symbol.toUpperCase()}/${market.toUpperCase()}`

  const ohlcv = await exchange.fetchOHLCV(pair, timeframe, undefined, limit)

  return ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
    timestamp: Number(timestamp),
    date: new Date(Number(timestamp)).toISOString(),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
  }))
}

/**
 * Get supported timeframes for a specific exchange
 */
export async function getSupportedTimeframes(exchangeName: string = 'binance'): Promise<string[]> {
  try {
    const ExchangeClass = ccxt[exchangeName.toLowerCase() as keyof typeof ccxt]
    if (!ExchangeClass || typeof ExchangeClass !== 'function') {
      return []
    }

    const exchange = new (ExchangeClass as any)()

    // Return supported timeframes if exchange provides them
    return exchange.timeframes ? Object.keys(exchange.timeframes) : []
  } catch {
    return []
  }
}
