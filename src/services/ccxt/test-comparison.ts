/**
 * Test script to verify CCXT is working correctly
 *
 * This tests CCXT functionality to ensure it's ready to replace Alpha Vantage
 *
 * Usage:
 * pnpm tsx src/services/ccxt/test-comparison.ts
 */

import {
  getExchangeRate as getCCXTRate,
  getMultiExchangeRate,
  getSupportedExchanges,
} from './exchangeRate'

async function testSingleExchange() {
  console.log('🧪 Test 1: Single Exchange Rate (BTC/USDT)\n')

  try {
    console.log('🚀 CCXT (Binance):')
    const ccxtStart = Date.now()
    const ccxtResult = await getCCXTRate('BTC', 'USDT', 'binance')
    const ccxtTime = Date.now() - ccxtStart
    console.log('  Exchange:', ccxtResult.exchange)
    console.log('  Pair:', ccxtResult.pair)
    console.log('  Price: $' + ccxtResult.price.toLocaleString())
    console.log('  Volume 24h:', ccxtResult.volume24h.toLocaleString(), 'BTC')
    console.log('  High 24h: $' + ccxtResult.high24h.toLocaleString())
    console.log('  Low 24h: $' + ccxtResult.low24h.toLocaleString())
    console.log('  Change 24h: $' + ccxtResult.change24h.toFixed(2), `(${ccxtResult.changePercent24h.toFixed(2)}%)`)
    console.log('  Last Updated:', ccxtResult.lastUpdated)
    console.log(`  Latency: ${ccxtTime}ms`)

    console.log('\n✅ CCXT is working perfectly!')
    console.log('💡 Note: Most exchanges use USDT (Tether) instead of USD')
    console.log('   For fiat conversions, use Kraken or Coinbase which support real USD\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  console.log('─'.repeat(60) + '\n')
}

async function testMultiExchange() {
  console.log('🧪 Test 2: Multi-Exchange Comparison (BTC/USD)\n')

  try {
    console.log('🚀 Fetching from Binance, Coinbase, and Kraken...\n')
    const multiResult = await getMultiExchangeRate('BTC', 'USD', [
      'binance',
      'coinbase',
      'kraken',
    ])

    console.log('📊 Results:')
    multiResult.results.forEach(result => {
      console.log(`  ${result.exchange.padEnd(10)}: $${result.price.toLocaleString()}`)
    })

    console.log('\n💰 Price Analysis:')
    console.log(`  Best Price:    $${multiResult.bestPrice.price.toLocaleString()} on ${multiResult.bestPrice.exchange}`)
    console.log(`  Worst Price:   $${multiResult.worstPrice.price.toLocaleString()} on ${multiResult.worstPrice.exchange}`)
    console.log(`  Average Price: $${multiResult.averagePrice.toLocaleString()}`)
    console.log(`  Price Spread:  $${multiResult.priceSpread.toFixed(2)} (${multiResult.priceSpreadPercent.toFixed(3)}%)`)

    if (multiResult.priceSpreadPercent > 0.5) {
      console.log('\n🎯 ARBITRAGE OPPORTUNITY DETECTED!')
      console.log(`   Buy on ${multiResult.bestPrice.exchange}, sell on ${multiResult.worstPrice.exchange}`)
      console.log(`   Potential profit: ${multiResult.priceSpreadPercent.toFixed(2)}% per trade`)
    }

    console.log()
  } catch (error) {
    console.error('❌ Error:', error)
  }

  console.log('─'.repeat(60) + '\n')
}

async function testDifferentPairs() {
  console.log('🧪 Test 3: Different Trading Pairs\n')

  const testPairs = [
    { crypto: 'ETH', fiat: 'USDT', exchange: 'binance' },
    { crypto: 'SOL', fiat: 'USDT', exchange: 'binance' },
    { crypto: 'BTC', fiat: 'EUR', exchange: 'kraken' }, // Kraken supports EUR
    { crypto: 'BTC', fiat: 'CHF', exchange: 'kraken' }, // Swiss Francs (for SwissFix customers!)
    { crypto: 'XRP', fiat: 'USDT', exchange: 'binance' },
    { crypto: 'ADA', fiat: 'USDT', exchange: 'binance' },
  ]

  for (const { crypto, fiat, exchange } of testPairs) {
    try {
      const result = await getCCXTRate(crypto, fiat, exchange)
      console.log(`${result.pair} (${exchange}): $${result.price.toLocaleString()} (${result.changePercent24h > 0 ? '+' : ''}${result.changePercent24h.toFixed(2)}%)`)
    } catch (error) {
      console.log(`${crypto}/${fiat} (${exchange}): ❌ Not available`)
    }
  }

  console.log('\n' + '─'.repeat(60) + '\n')
}

async function showSupportedExchanges() {
  console.log('🧪 Test 4: Supported Exchanges\n')

  const allExchanges = await getSupportedExchanges()
  console.log(`📊 CCXT supports ${allExchanges.length} exchanges!\n`)

  const popularExchanges = [
    'binance',
    'coinbase',
    'kraken',
    'bybit',
    'okx',
    'kucoin',
    'bitfinex',
    'gemini',
    'huobi',
    'bitstamp',
  ]

  console.log('Popular exchanges available:')
  popularExchanges.forEach(exchange => {
    const supported = allExchanges.includes(exchange)
    console.log(`  ${supported ? '✅' : '❌'} ${exchange}`)
  })

  console.log('\n' + '─'.repeat(60) + '\n')
}

async function runAllTests() {
  console.log('=' .repeat(60))
  console.log('    CCXT vs Alpha Vantage Comparison Test')
  console.log('=' .repeat(60) + '\n')

  await testSingleExchange()
  await testMultiExchange()
  await testDifferentPairs()
  await showSupportedExchanges()

  console.log('=' .repeat(60))
  console.log('    ✅ All Tests Complete!')
  console.log('=' .repeat(60) + '\n')

  console.log('📌 Next Steps:')
  console.log('  1. Review the results above')
  console.log('  2. Verify CCXT prices match Alpha Vantage (should be very close)')
  console.log('  3. If everything looks good, update chatbot to use CCXT')
  console.log('  4. Remove Alpha Vantage/RapidAPI dependency\n')
}

// Run all tests
runAllTests().catch(console.error)
