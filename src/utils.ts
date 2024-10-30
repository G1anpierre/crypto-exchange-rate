import {fiatFormat} from './static'

export const transform = (value: number, fiatCurrency: string) => {
  if (!value) return
  const formaterSymbol = fiatFormat[fiatCurrency]

  const format = new Intl.NumberFormat(formaterSymbol, {
    style: 'currency',
    currency: fiatCurrency,
  }).format

  return format(value)
}

export const formatWalletAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
