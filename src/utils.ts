import {fiatFormat} from './static'

export const transform = (value: number, fiatCurrency: string) => {
  if (!value) return

  // Map stablecoins to their fiat equivalents for Intl.NumberFormat
  // USDT, USDC, DAI are all USD-pegged stablecoins
  const currencyMap: Record<string, string> = {
    USDT: 'USD',
    USDC: 'USD',
    DAI: 'USD',
  }

  const formattingCurrency = currencyMap[fiatCurrency] || fiatCurrency
  const formaterSymbol = fiatFormat[fiatCurrency] || fiatFormat['USD'] // Fallback to USD formatting

  const format = new Intl.NumberFormat(formaterSymbol, {
    style: 'currency',
    currency: formattingCurrency,
  }).format

  return format(value)
}

export const formatWalletAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
