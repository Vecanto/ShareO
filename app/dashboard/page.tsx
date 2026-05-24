import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { decryptPasswordSync } from '@/lib/hash'
import { supabase as adminSupabase } from '@/lib/supabase'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user files from the database using admin client to bypass RLS
  const { data: files, error } = await adminSupabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching dashboard files:', error)
  }

  // Map to a cleaner format and decrypt the password for display
  const formattedFiles = (files || []).map((f) => {
    const isExpired = Date.now() >= f.expires_at
    const rawPassword = f.password ? decryptPasswordSync(f.password) : null

    return {
      id: f.id,
      originalName: f.original_name,
      createdAt: f.created_at,
      expiresAt: f.expires_at,
      isExpired,
      password: rawPassword,
    }
  })

  return (
    <div className="ab">
      <main className="ab-content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className="ab-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Your Files</h1>
            <p>Manage your uploads, view remaining validity, and retrieve passwords.</p>
          </div>
          <div>
            <form action="/auth/signout" method="post">
              <button className="cn-submit-btn" style={{ padding: '8px 16px', background: 'var(--border-2)', color: 'var(--text)' }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {formattedFiles.length === 0 ? (
          <div className="ab-tagline">
            You haven't uploaded any files while logged in yet.
          </div>
        ) : (
          <DashboardClient files={formattedFiles} />
        )}
      </main>
    </div>
  )
}
