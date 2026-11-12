import type { Metadata, Viewport } from 'next'
import Navbar from '@/components/Navbar'
import AuthSessionProvider from '@/components/AuthSessionProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ShareO — Instant File Transfer',
    template: '%s — ShareO',
  },
  description: 'Share files through a link. Add an optional password, and links expire after 24 hours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ShareO — Instant File Transfer',
    description: 'Share files through a link with optional password protection and a 24-hour lifetime.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#18362c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <Navbar />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
