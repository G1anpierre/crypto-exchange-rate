'use server'

import ccxt from 'ccxt'

/**
 * CCXT Exchange Rate Service
 *
 * This is a professional replacement for Alpha Vantage/RapidAPI
 * Benefits:
 * - FREE (no API key needed for market data)
 * - Direct connection to exchanges (no middleman)
 * - 107+ exchanges supported
 * - Multi-exchange comparison
 * - Lower latency
 */

export interface ExchangeRateResult {
  exchange: string
  pair: string
  price: number
  volume24h: number
  high24h: number
  low24h: number
  change24h: number
  changePercent24h: number
  timestamp: number
  lastUpdated: string
}

export interface MultiExchangeResult {
  pair: string
  results: ExchangeRateResult[]
  bestPrice: {
    exchange: string
    price: number
  }
  worstPrice: {
    exchange: string
    price: number
  }
  averagePrice: number
  priceSpread: number
  priceSpreadPercent: number
}

/**
 * Supported exchanges for crypto price data
 * Start with the most popular/reliable exchanges
 */
const DEFAULT_EXCHANGES = ['binance', 'coinbase', 'kraken']

/**
 * Get exchange rate from a single exchange
 *
 * @param fromCryptoCurrency - Crypto symbol (e.g., 'BTC', 'ETH', 'SOL')
 * @param toFiatCurrency - Fiat currency (e.g., 'USD', 'EUR', 'CHF')
 * @param exchangeName - Exchange to query (default: 'binance')
 * @returns Exchange rate data
 */
export async function getExchangeRate(
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
  exchangeName: string = 'binance'
): Promise<ExchangeRateResult> {
  // Normalize inputs
  const crypto = fromCryptoCurrency.toUpperCase()
  const requestedFiat = toFiatCurrency.toUpperCase()
  const exchange = exchangeName.toLowerCase()

  // Create exchange instance
  const ExchangeClass = ccxt[exchange as keyof typeof ccxt]
  if (!ExchangeClass || typeof ExchangeClass !== 'function') {
    throw new Error(`Exchange '${exchangeName}' not supported by CCXT`)
  }

  // Configuration with optional API keys for higher rate limits
  const config: any = {
    enableRateLimit: true, // Respect exchange rate limits
    timeout: 10000, // 10 second timeout
  }

  // Add Binance API keys if available (increases rate limits)
  if (exchange === 'binance' && process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET) {
    config.apiKey = process.env.BINANCE_API_KEY
    config.secret = process.env.BINANCE_API_SECRET
  }

  const exchangeInstance = new (ExchangeClass as any)(config)

  // Smart multi-tier fallback for currency pairs
  const fallbackCurrencies = [requestedFiat]

  // Add fallbacks if original currency likely won't work
  if (!['USD', 'USDT', 'USDC', 'EUR', 'GBP', 'BTC', 'ETH'].includes(requestedFiat)) {
    fallbackCurrencies.push('USDT', 'USD', 'EUR')
  } else if (requestedFiat === 'USD') {
    fallbackCurrencies.push('USDT')
  }

  let ticker
  let successfulPair = ''
  const attemptedPairs: string[] = []

  // Try each currency in fallback order
  for (const currency of fallbackCurrencies) {
    const pair = `${crypto}/${currency}`
    attemptedPairs.push(pair)

    try {
      ticker = await exchangeInstance.fetchTicker(pair)
      successfulPair = pair
      break // Success! Exit the loop
    } catch (error) {
      // If this is the last fallback, throw error
      if (currency === fallbackCurrencies[fallbackCurrencies.length - 1]) {
        const triedPairs = attemptedPairs.join(', ')
        if (error instanceof Error) {
          throw new Error(
            `Failed to fetch ${fromCryptoCurrency}/${toFiatCurrency} from ${exchangeName}. ` +
            `Tried: ${triedPairs}. Error: ${error.message}`
          )
        }
        throw new Error(`Failed to fetch exchange rate. Tried: ${triedPairs}`)
      }
      // Otherwise, continue to next fallback
    }
  }

  if (!ticker) {
    throw new Error(`Failed to fetch ${fromCryptoCurrency}/${toFiatCurrency} from ${exchangeName}`)
  }

  // Calculate 24h change
  const change24h = ticker.last - ticker.open
  const changePercent24h = ((change24h / ticker.open) * 100)

  return {
    exchange: exchangeName,
    pair: successfulPair,
    price: ticker.last,
    volume24h: ticker.baseVolume || 0,
    high24h: ticker.high || ticker.last,
    low24h: ticker.low || ticker.last,
    change24h,
    changePercent24h,
    timestamp: ticker.timestamp || Date.now(),
    lastUpdated: new Date(ticker.timestamp || Date.now()).toISOString(),
  }
}

/**
 * Get exchange rate from multiple exchanges simultaneously
 * This is a PREMIUM feature - shows arbitrage opportunities!
 *
 * @param fromCryptoCurrency - Crypto symbol
 * @param toFiatCurrency - Fiat currency
 * @param exchanges - Array of exchange names (default: binance, coinbase, kraken)
 * @returns Multi-exchange comparison data
 */
export async function getMultiExchangeRate(
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
  exchanges: string[] = DEFAULT_EXCHANGES
): Promise<MultiExchangeResult> {
  const pair = `${fromCryptoCurrency.toUpperCase()}/${toFiatCurrency.toUpperCase()}`

  // Fetch from all exchanges in parallel
  const results = await Promise.allSettled(
    exchanges.map(exchange =>
      getExchangeRate(fromCryptoCurrency, toFiatCurrency, exchange)
    )
  )

  // Filter successful results
  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<ExchangeRateResult> =>
      result.status === 'fulfilled'
    )
    .map(result => result.value)

  if (successfulResults.length === 0) {
    throw new Error(`Failed to fetch ${pair} from any exchange`)
  }

  // Find best and worst prices
  const bestPrice = successfulResults.reduce((min, result) =>
    result.price < min.price ? result : min
  )

  const worstPrice = successfulResults.reduce((max, result) =>
    result.price > max.price ? result : max
  )

  // Calculate average price
  const averagePrice = successfulResults.reduce((sum, result) =>
    sum + result.price, 0
  ) / successfulResults.length

  // Calculate price spread (arbitrage opportunity)
  const priceSpread = worstPrice.price - bestPrice.price
  const priceSpreadPercent = (priceSpread / bestPrice.price) * 100

  return {
    pair,
    results: successfulResults,
    bestPrice: {
      exchange: bestPrice.exchange,
      price: bestPrice.price,
    },
    worstPrice: {
      exchange: worstPrice.exchange,
      price: worstPrice.price,
    },
    averagePrice,
    priceSpread,
    priceSpreadPercent,
  }
}

/**
 * Get all supported exchanges by CCXT
 * Useful for showing users which exchanges they can query
 */
export async function getSupportedExchanges(): Promise<string[]> {
  return ccxt.exchanges
}

/**
 * Check if a specific exchange is supported
 */
export async function isExchangeSupported(exchangeName: string): Promise<boolean> {
  return ccxt.exchanges.includes(exchangeName.toLowerCase())
}
