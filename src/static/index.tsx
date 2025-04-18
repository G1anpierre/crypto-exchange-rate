export const cryptocurrencies = [
  {value: 'BTC', label: 'Bitcoin'},
  {value: 'ETH', label: 'Ethereum'},
  {value: 'BCH', label: 'Bitcoin Cash'},
  {value: 'XRP', label: 'Ripple'},
  {value: 'SOL', label: 'Solana'},
  {value: 'ADA', label: 'Cardano'},
  {value: 'BNB', label: 'Binance Coin'},
]

export const fiatCurrencies = [
  {value: 'USD', label: 'US Dollar'},
  {value: 'GBP', label: 'British Pound'},
  {value: 'EUR', label: 'Euro'},
  {value: 'NGN', label: 'Naira'},
  {value: 'CNY', label: 'Chinese Yuan'},
  {value: 'RUB', label: 'Russian Ruble'},
  {value: 'SGD', label: 'Singaporean Dollar'},
]

export const timePeriods = [
  {value: 'DIGITAL_CURRENCY_DAILY', label: 'Daily'},
  {value: 'DIGITAL_CURRENCY_WEEKLY', label: 'Weekly'},
  {value: 'DIGITAL_CURRENCY_MONTHLY', label: 'Monthly'},
]

type FiatFormatType = {
  [key: string]: string
}

export const fiatFormat: FiatFormatType = {
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'en-DE',
  NGN: 'en-NG',
  CNY: 'zh-Hans',
  RUB: 'ru-RU',
  SGD: 'en-SG',
}

export const dataKeys = [
  {type: 'close', color: '#8884d8'},
  {type: 'open', color: '#82ca9d'},
  {type: 'high', color: '#B03A2E'},
  {type: 'low', color: '#2874A6'},
]

export const newsSources = [
  
  {
    id: '1',
    name: 'Bitcoinist',
    searchParams: 'bitcoinist',
    imageUrl: '/bitcoinist.webp',
  },
  {
    id: '2',
    name: 'CoinTelegraph',
    searchParams: 'cointelegraph',
    imageUrl: '/cointelegraph.png',
  },
  {
    id: '3',
    name: 'Decrypt',
    searchParams: 'decrypt',
    imageUrl: '/decrypt-seeklogo.svg',
  },
  {
    id: '4',
    name: 'BSC News',
    searchParams: 'bsc',
    imageUrl: '/bsc-news.svg',
  },
  {
    id: '5',
    name: 'The Guardian',
    searchParams: 'theguardian',
    imageUrl: '/the-guardian.png',
  },
  {
    id: '6',
    name: 'Coindesk',
    searchParams: 'coindesk',
    imageUrl: '/coindesk-logo-hq.png',
  },
  {
    id: '7',
    name: 'Cryptodaily',
    searchParams: 'cryptodaily',
    imageUrl: '/crypto-daily-logo.png',
  }
]

export const DEFAULT_NEWS_PLATFORM = 'bitcoinist'
