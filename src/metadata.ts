import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Crypto Exchange App',
    description: 'Get the latest crypto exchange rates',
    keywords: ['crypto', 'exchange', 'rates'],
    openGraph: {
      title: 'Crypto Exchange App',
      description: 'Get the latest crypto exchange rates',
      type: 'website',
      locale: 'en_US',
      url: 'https://crypto-exchange-rate.vercel.app',
      images: [
        {
          url: 'https://ccrypto-exchange-rate.vercel.app/cryptocurrent-favicon-black.png',
          width: 800,
          height: 600,
          alt: 'Crypto Exchange App',
        },
      ],
    },
  }