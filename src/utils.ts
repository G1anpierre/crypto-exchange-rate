import {fiatFormat} from './static'

export const transform = (value: number, fiatCurrency: string) => {
  if(!value) return
  const formaterSymbol = fiatFormat[fiatCurrency]

  const format = new Intl.NumberFormat(formaterSymbol, {
    style: 'currency',
    currency: fiatCurrency,
  }).format

  return format(value)
}
