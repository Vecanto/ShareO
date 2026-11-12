import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { decryptPasswordSync } from '@/lib/hash'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getPrismaClient } from '@/lib/prisma'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const files = await getPrismaClient().fileShare.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const formattedFiles = files.map((file) => {
    return {
      id: file.id,
      originalName: file.originalName,
      createdAt: file.createdAt.toISOString(),
      expiresAt: file.expiresAt.getTime(),
      isExpired: Date.now() >= file.expiresAt.getTime(),
      password: file.password ? decryptPasswordSync(file.password) : null,
    }
  })

  return (
    <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>Your Files</h1>
            <p>Manage your uploads, expiry dates, and share links.</p>
          </div>
          <SignOutButton />
        </header>

        {formattedFiles.length === 0 ? (
          <div className="dashboard-empty">
            <h2>Your register is empty.</h2>
            <p>Files you upload while signed in will appear here.</p>
            <Link href="/#transfer" className="primary-cta">Create a handoff</Link>
          </div>
        ) : (
          <DashboardClient files={formattedFiles} />
        )}
    </main>
  )
}
