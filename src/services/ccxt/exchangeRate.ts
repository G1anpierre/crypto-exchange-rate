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
 * Always uses Kraken for reliability and no geo-restrictions
 *
 * @param fromCryptoCurrency - Crypto symbol (e.g., 'BTC', 'ETH', 'SOL')
 * @param toFiatCurrency - Fiat currency (e.g., 'USD', 'EUR', 'GBP')
 * @param exchangeName - Kept for backward compatibility (always uses Kraken)
 * @returns Exchange rate data
 */
export async function getExchangeRate(
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
  _exchangeName: string = 'kraken'  // Kept for backward compatibility (unused - always uses Kraken)
): Promise<ExchangeRateResult> {
  // Normalize inputs
  const crypto = fromCryptoCurrency.toUpperCase()
  const requestedFiat = toFiatCurrency.toUpperCase()

  // Always use Kraken - no geo-restrictions, reliable, no API key needed
  const exchangeInstance = new ccxt.kraken({
    enableRateLimit: true,
    timeout: 10000,
  })

  // Kraken supports real fiat currencies (USD, EUR, GBP, etc.)
  // Define fallback order based on requested currency
  const fallbackCurrencies = [requestedFiat]

  // Add fallbacks if original currency likely won't work
  if (!['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'CHF', 'AUD'].includes(requestedFiat)) {
    fallbackCurrencies.push('USD', 'EUR')
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
            `Failed to fetch ${fromCryptoCurrency}/${toFiatCurrency} from Kraken. ` +
            `Tried: ${triedPairs}. Error: ${error.message}`
          )
        }
        throw new Error(`Failed to fetch exchange rate. Tried: ${triedPairs}`)
      }
      // Otherwise, continue to next fallback
    }
  }

  if (!ticker) {
    throw new Error(`Failed to fetch ${fromCryptoCurrency}/${toFiatCurrency} from Kraken`)
  }

  // Calculate 24h change
  const change24h = (ticker.last || 0) - (ticker.open || 0)
  const changePercent24h = ticker.open ? ((change24h / ticker.open) * 100) : 0

  return {
    exchange: 'kraken',  // Always Kraken
    pair: successfulPair,
    price: ticker.last || 0,
    volume24h: ticker.baseVolume || 0,
    high24h: ticker.high || ticker.last || 0,
    low24h: ticker.low || ticker.last || 0,
    change24h,
    changePercent24h,
    timestamp: ticker.timestamp || Date.now(),
    lastUpdated: new Date(ticker.timestamp || Date.now()).toISOString(),
  }
}

/**
 * Get exchange rate from multiple exchanges simultaneously
 * NOTE: Currently only uses Kraken (single source) for reliability
 * Multi-exchange comparison has been simplified to avoid geo-restrictions
 *
 * @param fromCryptoCurrency - Crypto symbol
 * @param toFiatCurrency - Fiat currency
 * @param _exchanges - Kept for backward compatibility (unused - always uses Kraken only)
 * @returns Exchange rate data (single result from Kraken)
 */
export async function getMultiExchangeRate(
  fromCryptoCurrency: string = 'BTC',
  toFiatCurrency: string = 'USD',
  _exchanges: string[] = DEFAULT_EXCHANGES
): Promise<MultiExchangeResult> {
  const pair = `${fromCryptoCurrency.toUpperCase()}/${toFiatCurrency.toUpperCase()}`

  // Simplified: Only use Kraken to avoid geo-restrictions and API complexity
  const krakenResult = await getExchangeRate(fromCryptoCurrency, toFiatCurrency, 'kraken')

  // Return single result in multi-exchange format for backward compatibility
  return {
    pair,
    results: [krakenResult],
    bestPrice: {
      exchange: krakenResult.exchange,
      price: krakenResult.price,
    },
    worstPrice: {
      exchange: krakenResult.exchange,
      price: krakenResult.price,
    },
    averagePrice: krakenResult.price,
    priceSpread: 0,  // No spread with single exchange
    priceSpreadPercent: 0,
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
