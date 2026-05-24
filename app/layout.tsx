import type { Metadata, Viewport } from 'next'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ShareO — Instant File Transfer',
    template: '%s — ShareO',
  },
  description: 'Dead-simple, no-signup file transfer. Upload, share a link, done. Files expire in 24 hours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ShareO — Instant File Transfer',
    description: 'Dead-simple, no-signup file transfer. Upload, share a link, done.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
