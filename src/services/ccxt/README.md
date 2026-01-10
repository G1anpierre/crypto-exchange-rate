# CCXT Integration Guide

## Overview

This directory contains the **CCXT-based cryptocurrency data services** that
replace the Alpha Vantage/RapidAPI implementation.

**Why CCXT?**

- ✅ **FREE** - No API keys needed for market data
- ✅ **107+ exchanges** - Binance, Coinbase, Kraken, and more
- ✅ **Professional** - Industry standard for crypto trading
- ✅ **Lower latency** - Direct connection to exchanges
- ✅ **No vendor lock-in** - Open-source (MIT license)
- ✅ **Better features** - Multi-exchange comparison, arbitrage detection

## Files

### `exchangeRate.ts`

Replacement for `src/services/exchangeRate.ts` (Alpha Vantage)

**Functions:**

- `getExchangeRate(crypto, fiat, exchange)` - Get price from single exchange
- `getMultiExchangeRate(crypto, fiat, exchanges)` - Compare prices across
  multiple exchanges
- `getSupportedExchanges()` - List all 107+ supported exchanges
- `isExchangeSupported(exchange)` - Check if exchange is available

**Example Usage:**

```typescript
import {
  getExchangeRate,
  getMultiExchangeRate,
} from '@/services/ccxt/exchangeRate'

// Single exchange
const btcPrice = await getExchangeRate('BTC', 'USD', 'binance')
console.log(`BTC Price: $${btcPrice.price}`)

// Multi-exchange comparison (arbitrage detection)
const comparison = await getMultiExchangeRate('BTC', 'USD', [
  'binance',
  'coinbase',
  'kraken',
])
console.log(
  `Best price: $${comparison.bestPrice.price} on ${comparison.bestPrice.exchange}`,
)
console.log(
  `Arbitrage opportunity: ${comparison.priceSpreadPercent.toFixed(2)}%`,
)
```

### `historicalData.ts`

Replacement for `cryptoStadistics()` (Alpha Vantage historical data)

**Functions:**

- `getCryptoHistoricalData(symbol, market, timeframe, limit)` - Get OHLCV data
- `cryptoStadistics(market, symbol, func)` - Drop-in replacement for old
  function
- `getRealtimeCandles(symbol, market, timeframe)` - Live candlestick data
- `getSupportedTimeframes(exchange)` - Available timeframes per exchange

**Example Usage:**

```typescript
import {
  cryptoStadistics,
  getCryptoHistoricalData,
} from '@/services/ccxt/historicalData'

// Drop-in replacement (same signature as Alpha Vantage)
const weeklyData = await cryptoStadistics(
  'USD',
  'BTC',
  'DIGITAL_CURRENCY_WEEKLY',
)

// New flexible API
const dailyData = await getCryptoHistoricalData(
  'BTC',
  'USD',
  '1d',
  90,
  'binance',
)
```

### `test-comparison.ts`

Test script to compare Alpha Vantage vs CCXT

**Run the test:**

```bash
# Install tsx if not already installed
pnpm add -D tsx

# Run comparison test
pnpm tsx src/services/ccxt/test-comparison.ts
```

**What it tests:**

1. Single exchange rate (Alpha Vantage vs CCXT)
2. Multi-exchange comparison (new feature!)
3. Different trading pairs (ETH, SOL, BTC/EUR, BTC/CHF)
4. List of supported exchanges

## Migration Guide

### Phase 1: Install CCXT ✅

```bash
pnpm add ccxt
```

### Phase 2: Test CCXT (Do this now!)

```bash
pnpm tsx src/services/ccxt/test-comparison.ts
```

**Expected output:**

- BTC/USD price from Alpha Vantage
- BTC/USD price from CCXT (should be very similar)
- Multi-exchange comparison showing arbitrage opportunities
- Latency comparison (CCXT should be faster)

### Phase 3: Update Chatbot (src/app/api/chat/route.ts)

**Before:**

```typescript
import {getExchangeRate} from '@/services/exchangeRate'

const data = await getExchangeRate(fromCrypto, toFiat)
```

**After (Option 1: Simple replacement):**

```typescript
import {getExchangeRate} from '@/services/ccxt/exchangeRate'

const data = await getExchangeRate(fromCrypto, toFiat, 'binance')
```

**After (Option 2: Multi-exchange with arbitrage):**

```typescript
import {getMultiExchangeRate} from '@/services/ccxt/exchangeRate'

const data = await getMultiExchangeRate(fromCrypto, toFiat, [
  'binance',
  'coinbase',
  'kraken',
])

// Return rich data to user
return {
  bestPrice: `$${data.bestPrice.price} on ${data.bestPrice.exchange}`,
  averagePrice: `$${data.averagePrice.toFixed(2)}`,
  arbitrage:
    data.priceSpreadPercent > 0.5
      ? `${data.priceSpreadPercent.toFixed(2)}% profit opportunity!`
      : 'No significant arbitrage',
  allPrices: data.results.map(r => `${r.exchange}: $${r.price}`).join(', '),
}
```

### Phase 4: Update Historical Data

**Before:**

```typescript
import {cryptoStadistics} from '@/services/exchangeRate'

const prices = await cryptoStadistics('USD', 'BTC', 'DIGITAL_CURRENCY_WEEKLY')
```

**After:**

```typescript
import {cryptoStadistics} from '@/services/ccxt/historicalData'

const prices = await cryptoStadistics('USD', 'BTC', 'DIGITAL_CURRENCY_WEEKLY')
// Same signature, drop-in replacement!
```

### Phase 5: Remove Alpha Vantage

Once CCXT is working:

1. Delete or rename old file:

   ```bash
   mv src/services/exchangeRate.ts src/services/exchangeRate.OLD.ts
   ```

2. Remove RapidAPI key from `.env.local`:

   ```diff
   - NEXT_PUBLIC_RAPID_API_KEY=your_key_here
   ```

3. Update imports across your codebase:

   ```bash
   # Find all imports
   grep -r "from '@/services/exchangeRate'" src/

   # Replace with CCXT imports
   ```

## New Features with CCXT

### 1. Multi-Exchange Arbitrage Detection

```typescript
import {getMultiExchangeRate} from '@/services/ccxt/exchangeRate'

const comparison = await getMultiExchangeRate('BTC', 'USD')

if (comparison.priceSpreadPercent > 0.5) {
  console.log('🎯 ARBITRAGE OPPORTUNITY!')
  console.log(
    `Buy on ${comparison.bestPrice.exchange} for $${comparison.bestPrice.price}`,
  )
  console.log(
    `Sell on ${comparison.worstPrice.exchange} for $${comparison.worstPrice.price}`,
  )
  console.log(`Profit: ${comparison.priceSpreadPercent.toFixed(2)}%`)
}
```

### 2. Real-time Candlestick Charts

```typescript
import {getRealtimeCandles} from '@/services/ccxt/historicalData'

// Get last 60 minutes of 1-minute candles
const candles = await getRealtimeCandles('BTC', 'USD', '1m', 60)

// Perfect for live charts!
```

### 3. Historical Data with Multiple Timeframes

```typescript
import {getCryptoHistoricalData} from '@/services/ccxt/historicalData'

// Last 90 days of daily data
const dailyPrices = await getCryptoHistoricalData('BTC', 'USD', '1d', 90)

// Last 52 weeks of weekly data
const weeklyPrices = await getCryptoHistoricalData('BTC', 'USD', '1w', 52)

// Last 24 hours of hourly data
const hourlyPrices = await getCryptoHistoricalData('BTC', 'USD', '1h', 24)
```

### 4. Support for 107+ Exchanges

```typescript
import {getSupportedExchanges} from '@/services/ccxt/exchangeRate'

const allExchanges = getSupportedExchanges()
console.log(`CCXT supports ${allExchanges.length} exchanges!`)
// Output: CCXT supports 107 exchanges!

// Let users choose their preferred exchange
const userExchange = 'kraken'
const price = await getExchangeRate('BTC', 'USD', userExchange)
```

## Chatbot Tool Example

Update your chatbot tool to use CCXT with multi-exchange support:

```typescript
// src/app/api/chat/route.ts
import {tool} from 'ai'
import {z} from 'zod'
import {getMultiExchangeRate} from '@/services/ccxt/exchangeRate'

const getExchangeRate = tool({
  description:
    'Get cryptocurrency exchange rates with multi-exchange comparison and arbitrage detection',
  inputSchema: z.object({
    fromCryptoCurrency: z
      .string()
      .describe('Cryptocurrency symbol like BTC, ETH, SOL'),
    toFiatCurrency: z
      .string()
      .describe('Fiat currency code like USD, EUR, CHF'),
    exchanges: z
      .array(z.string())
      .optional()
      .describe('Exchanges to compare (e.g., binance, coinbase, kraken)'),
  }),
  execute: async ({fromCryptoCurrency, toFiatCurrency, exchanges}) => {
    try {
      const result = await getMultiExchangeRate(
        fromCryptoCurrency,
        toFiatCurrency,
        exchanges || ['binance', 'coinbase', 'kraken'],
      )

      // Build rich response
      const response = {
        success: true,
        pair: result.pair,
        prices: result.results.map(r => ({
          exchange: r.exchange,
          price: r.price,
          volume24h: r.volume24h,
          change24h: r.changePercent24h,
        })),
        bestPrice: {
          exchange: result.bestPrice.exchange,
          price: result.bestPrice.price,
        },
        averagePrice: result.averagePrice,
        arbitrageOpportunity:
          result.priceSpreadPercent > 0.5
            ? {
                profitPercent: result.priceSpreadPercent,
                buyOn: result.bestPrice.exchange,
                sellOn: result.worstPrice.exchange,
                message: `Buy on ${result.bestPrice.exchange}, sell on ${result.worstPrice.exchange} for ${result.priceSpreadPercent.toFixed(2)}% profit`,
              }
            : null,
      }

      return response
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },
})
```

## Performance

**Latency comparison (typical):**

- Alpha Vantage (via RapidAPI): 800-1500ms
- CCXT (direct to Binance): 200-500ms
- **CCXT is 2-3x faster!**

**Rate limits:**

- Alpha Vantage Free: 5 requests/minute, 500/day
- CCXT with Binance: 1,200 requests/minute, unlimited/day (for market data)
- **CCXT has 240x higher rate limits!**

## Costs

### Alpha Vantage (via RapidAPI):

- Free tier: 500 requests/day (you hit this while testing)
- Basic tier: $10-50/month for 10k requests
- **Annual cost: $120-600**

### CCXT:

- Market data: **FREE** (no API key needed)
- CCXT Pro (WebSocket): ~$500-1,000/year (only if you need real-time trading)
- **Annual cost: $0 for basic features**

**Savings: $120-600/year + unlimited testing!**

## Security Improvements

### Before (Alpha Vantage):

```typescript
// ❌ API key exposed in client-side environment variable
const apiKey = process.env.NEXT_PUBLIC_RAPID_API_KEY
```

### After (CCXT):

```typescript
// ✅ No API key needed for market data
// ✅ All requests are server-side only
```

## Troubleshooting

### Error: "Exchange not supported"

```typescript
import {isExchangeSupported} from '@/services/ccxt/exchangeRate'

if (!isExchangeSupported('myexchange')) {
  console.log('Exchange not available')
}
```

### Error: "Pair not available"

Some exchanges don't support all pairs. Handle gracefully:

```typescript
try {
  const price = await getExchangeRate('SOL', 'CHF', 'kraken')
} catch (error) {
  console.log('SOL/CHF not available on Kraken, trying Binance...')
  const price = await getExchangeRate('SOL', 'USDT', 'binance')
  // Convert USDT to CHF separately
}
```

### Rate Limiting

CCXT has built-in rate limiting. Enable it:

```typescript
const exchange = new ccxt.binance({
  enableRateLimit: true, // ✅ Always enable this
})
```

## Next Steps

1. ✅ **Install CCXT** - `pnpm add ccxt`
2. 🧪 **Run tests** - `pnpm tsx src/services/ccxt/test-comparison.ts`
3. 📝 **Review results** - Compare prices and latency
4. 🔄 **Update chatbot** - Replace Alpha Vantage with CCXT
5. 🧹 **Cleanup** - Remove RapidAPI dependency
6. 🚀 **Add new features** - Multi-exchange comparison, arbitrage alerts
7. 📊 **Update UI** - Show multi-exchange prices to users
8. 📝 **Blog post** - "Why We Switched to CCXT" (marketing!)

## Support

- **CCXT Docs**: https://docs.ccxt.com/
- **CCXT GitHub**: https://github.com/ccxt/ccxt
- **Supported Exchanges**:
  https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets

## License

CCXT is MIT licensed - free for commercial use.
