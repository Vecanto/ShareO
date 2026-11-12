'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const baseLinks = [
    { href: '/#transfer', label: 'Send a file' },
    { href: '/about', label: 'How it works' },
    { href: '/connect', label: 'Contact' },
  ]

  const rightLinks = session?.user
    ? [{ href: '/dashboard', label: 'Dashboard' }]
    : [{ href: '/login', label: 'Log In' }]

  const links = [...baseLinks, ...rightLinks]

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" aria-label="ShareO home">
          ShareO
        </Link>
        <div className="navbar-links">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={(href === '/#transfer' ? pathname === '/' : pathname === href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
