import TransferZone from '@/components/TransferZone'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ShareO',
}

export default function Home() {
  return <TransferZone />
}
