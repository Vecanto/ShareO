import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkAndRemoveIfExpired } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { getFileSizeString } from '@/lib/utils'

const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '24')
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const record = await checkAndRemoveIfExpired(id, FILE_EXPIRY_HOURS)

  if (!record) {
    return NextResponse.json({ error: 'File not found or expired' }, { status: 404 })
  }

  const locked = isLockedOut(record, LOCKOUT_DURATION_MINUTES)
  const attemptsLeft = 3 - record.attempts
  const unlockAt = locked ? getUnlockTime(record, LOCKOUT_DURATION_MINUTES) : undefined

  let sizeStr = 'Unknown size'
  // We no longer have local file size, but if you want it you can add it to the DB schema.

  return NextResponse.json({
    id,
    originalName: record.originalName,
    size: sizeStr,
    expiresAt: record.expiresAt,
    passwordProtected: !!record.hash,
    locked,
    attemptsLeft: locked ? 0 : Math.max(0, attemptsLeft),
    unlockAt
  })
}
