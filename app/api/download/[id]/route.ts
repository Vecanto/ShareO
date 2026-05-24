import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkAndRemoveIfExpired, updateFileAttempts } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { verifyPassword } from '@/lib/hash'

const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '24')
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const record = await checkAndRemoveIfExpired(id, FILE_EXPIRY_HOURS)

  if (!record) {
    return NextResponse.json({ error: 'File not found or expired' }, { status: 404 })
  }

  if (isLockedOut(record, LOCKOUT_DURATION_MINUTES)) {
    return NextResponse.json({
      locked: true,
      unlockAt: getUnlockTime(record, LOCKOUT_DURATION_MINUTES)
    }, { status: 423 })
  }

  if (record.hash) {
    const password = request.headers.get('x-file-password')
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 401 })
    }
    const valid = await verifyPassword(password, record.hash)
    if (!valid) {
      const newAttempts = record.attempts + 1
      const newLockedAt = newAttempts >= 3 ? Date.now() : record.lockedAt
      updateFileAttempts(id, newAttempts, newLockedAt)
      if (newAttempts >= 3) {
        return NextResponse.json({
          locked: true,
          unlockAt: getUnlockTime({ lockedAt: newLockedAt }, LOCKOUT_DURATION_MINUTES)
        }, { status: 423 })
      }
      return NextResponse.json({
        error: 'Invalid password',
        attemptsLeft: Math.max(0, 3 - newAttempts)
      }, { status: 401 })
    }
    updateFileAttempts(id, 0, null)
  }

  const { data, error } = await supabase.storage.from('uploads').download(record.storedName)
  
  if (error || !data) {
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer())

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(record.originalName)}"`,
      'Content-Type': data.type || 'application/octet-stream',
    },
  })
}
