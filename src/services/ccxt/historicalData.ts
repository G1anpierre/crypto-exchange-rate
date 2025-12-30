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
 * Get historical cryptocurrency price data (OHLCV)
 *
 * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param market - Market currency (e.g., 'USD', 'EUR', 'CNY')
 * @param timeframe - Timeframe for candles ('1d', '1w', '1M', etc.)
 * @param limit - Number of data points to fetch (default: 100)
 * @param exchangeName - Exchange to query (default: 'binance')
 * @returns Array of price data compatible with your Charts component
 */
export async function getCryptoHistoricalData(
  symbol: string = 'BTC',
  market: string = 'USD',
  timeframe: TimeframeType = '1d',
  limit: number = 100,
  exchangeName: string = 'binance'
): Promise<PriceType[]> {
  // Create exchange instance
  const ExchangeClass = ccxt[exchangeName.toLowerCase() as keyof typeof ccxt]
  if (!ExchangeClass || typeof ExchangeClass !== 'function') {
    throw new Error(`Exchange '${exchangeName}' not supported`)
  }

  const exchange = new (ExchangeClass as any)({
    enableRateLimit: true,
    timeout: 15000, // 15 second timeout (historical data can be slower)
  })

  // Smart multi-tier fallback for currency pairs
  const symbolUpper = symbol.toUpperCase()
  const requestedMarket = market.toUpperCase()

  // Define fallback order based on requested currency
  const fallbackCurrencies = [requestedMarket]

  // Add fallbacks if original currency likely won't work
  if (!['USD', 'USDT', 'USDC', 'EUR', 'GBP', 'BTC', 'ETH'].includes(requestedMarket)) {
    fallbackCurrencies.push('USDT', 'USD', 'EUR')
  } else if (requestedMarket === 'USD') {
    fallbackCurrencies.push('USDT')
  }

  let ohlcv
  const attemptedPairs: string[] = []

  // Try each currency in fallback order
  for (const currency of fallbackCurrencies) {
    const pair = `${symbolUpper}/${currency}`
    attemptedPairs.push(pair)

    try {
      ohlcv = await exchange.fetchOHLCV(pair, timeframe, undefined, limit)
      break // Success! Exit the loop
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

  if (!ohlcv) {
    throw new Error(`Failed to fetch historical data for ${symbol}/${market}`)
  }

  // Transform to PriceType format (compatible with your existing Charts)
  const prices: PriceType[] = ohlcv.map(([timestamp, open, high, low, close]: [number, number, number, number, number, number]) => ({
    date: new Date(timestamp).toISOString().split('T')[0], // Format: YYYY-MM-DD
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
  }))

  return prices
}

/**
 * Wrapper function compatible with existing cryptoStadistics signature
 * This makes migration easier - same function signature as Alpha Vantage version
 *
 * @param market - Market currency (e.g., 'USD', 'EUR', 'CNY')
 * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param func - Function type (maps to timeframe)
 * @returns Array of price data
 */
export async function cryptoStadistics(
  market: string = 'USD',
  symbol: string = 'BTC',
  func: string = 'DIGITAL_CURRENCY_WEEKLY'
): Promise<PriceType[]> {
  // Map Alpha Vantage function name to CCXT timeframe
  const timeframe = TIMEFRAME_MAP[func] || '1w'

  // Determine limit based on timeframe
  const limitMap: Record<TimeframeType, number> = {
    '1m': 60,   // Last hour
    '5m': 288,  // Last day
    '15m': 672, // Last week
    '30m': 336, // Last week
    '1h': 168,  // Last week
    '4h': 180,  // Last month
    '1d': 90,   // Last 3 months
    '1w': 52,   // Last year
    '1M': 24,   // Last 2 years
  }

  const limit = limitMap[timeframe] || 100

  return getCryptoHistoricalData(symbol, market, timeframe, limit, 'binance')
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
  const exchange = new ccxt.binance({ enableRateLimit: true })
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
