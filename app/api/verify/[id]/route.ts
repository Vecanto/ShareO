import { NextRequest, NextResponse } from 'next/server'
import { checkAndRemoveIfExpired, updateFileAttempts } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { verifyPassword } from '@/lib/hash'

const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '24')
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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

  const body = await request.json()
  const { password } = body

  if (!password) {
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
      success: false,
      attemptsLeft: Math.max(0, 3 - newAttempts)
    }, { status: 401 })
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
      success: false,
      attemptsLeft: Math.max(0, 3 - newAttempts)
    }, { status: 401 })
  }

  updateFileAttempts(id, 0, null)
  return NextResponse.json({ success: true, attemptsLeft: 3 })
}
