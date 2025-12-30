import {Icon} from "@iconify/react";

export const cryptocurrencies = [
  {value: 'BTC', label: 'Bitcoin'},
  {value: 'ETH', label: 'Ethereum'},
  {value: 'BNB', label: 'Binance Coin'},
  {value: 'SOL', label: 'Solana'},
  {value: 'XRP', label: 'Ripple'},
  {value: 'ADA', label: 'Cardano'},
  {value: 'DOGE', label: 'Dogecoin'},
  {value: 'MATIC', label: 'Polygon'},
  {value: 'DOT', label: 'Polkadot'},
  {value: 'AVAX', label: 'Avalanche'},
  {value: 'LINK', label: 'Chainlink'},
  {value: 'UNI', label: 'Uniswap'},
  {value: 'LTC', label: 'Litecoin'},
  {value: 'ATOM', label: 'Cosmos'},
  {value: 'XLM', label: 'Stellar'},
  {value: 'BCH', label: 'Bitcoin Cash'},
  {value: 'TRX', label: 'Tron'},
]

export const fiatCurrencies = [
  {value: 'USD', label: 'US Dollar'},
  {value: 'EUR', label: 'Euro'},
  {value: 'GBP', label: 'British Pound'},
  {value: 'USDT', label: 'Tether (USDT)'},
  {value: 'USDC', label: 'USD Coin (USDC)'},
  {value: 'AUD', label: 'Australian Dollar'},
  {value: 'BRL', label: 'Brazilian Real'},
  {value: 'TRY', label: 'Turkish Lira'},
  {value: 'JPY', label: 'Japanese Yen'},
  {value: 'KRW', label: 'South Korean Won'},
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
  EUR: 'en-DE',
  GBP: 'en-GB',
  USDT: 'en-US',
  USDC: 'en-US',
  AUD: 'en-AU',
  BRL: 'pt-BR',
  TRY: 'tr-TR',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
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
    rssUrl: 'https://bitcoinist.com/feed/',
  },
  {
    id: '2',
    name: 'CoinTelegraph',
    searchParams: 'cointelegraph',
    imageUrl: '/cointelegraph.png',
    rssUrl: 'https://cointelegraph.com/rss',
  },
  {
    id: '3',
    name: 'Decrypt',
    searchParams: 'decrypt',
    imageUrl: '/decrypt-seeklogo.svg',
    rssUrl: 'https://decrypt.co/feed',
  },
  {
    id: '4',
    name: 'BSC News',
    searchParams: 'bsc',
    imageUrl: '/bsc-news.svg',
    rssUrl: 'https://bsc.news/feed.xml',
  },
  {
    id: '5',
    name: 'Coindesk',
    searchParams: 'coindesk',
    imageUrl: '/coindesk-logo-hq.png',
    rssUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
  },
  {
    id: '6',
    name: 'Cryptodaily',
    searchParams: 'cryptodaily',
    imageUrl: '/crypto-daily-logo.png',
    rssUrl: 'https://cryptodaily.co.uk/feed',
  }
]

export const DEFAULT_NEWS_PLATFORM = 'bitcoinist'

export const donationPurposes = [
  {
    key: "education",
    title: "Support Crypto Education",
    icon: <Icon className="h-full w-full" icon="mdi:school-outline" />,
    descriptions: [
      "Help fund educational resources for blockchain and cryptocurrency.",
      "Support workshops and seminars to spread crypto awareness.",
      "Enable access to free learning materials for underprivileged communities.",
    ],
  },
  {
    key: "development",
    title: "Fund Crypto Development",
    icon: <Icon className="h-full w-full" icon="mdi:code-tags" />,
    descriptions: [
      "Contribute to the development of open-source blockchain projects.",
      "Support innovative crypto tools and applications.",
      "Help developers create secure and scalable crypto solutions.",
    ],
  },
  {
    key: "community",
    title: "Empower Crypto Communities",
    icon: <Icon className="h-full w-full" icon="mdi:account-group-outline" />,
    descriptions: [
      "Support local crypto meetups and events.",
      "Help build stronger communities around blockchain technology.",
      "Provide resources for community-driven crypto initiatives.",
    ],
  },
];