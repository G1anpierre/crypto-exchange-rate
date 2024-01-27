import {Hero} from '@/components/Hero'
import {StadisticChart} from '@/components/StadisticChart'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div>
        <Hero />
        <StadisticChart />
      </div>
    </main>
  )
}
