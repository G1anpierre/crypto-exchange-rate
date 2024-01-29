import {CryptoChart} from '@/components/CryptoChart'
import {Hero} from '@/components/Hero'
import {StadisticChart} from '@/components/StadisticChart'
import {useTranslations} from 'next-intl'

export default function Home() {
  const t = useTranslations('Stadistics')
  return (
    <main className="flex min-h-screen flex-col">
      <div>
        <Hero />
        {/* <StadisticChart /> */}
        <CryptoChart title={t('title')} description={t('description')} />
      </div>
    </main>
  )
}
