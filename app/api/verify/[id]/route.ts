import { NextRequest, NextResponse } from 'next/server'
import { checkAndRemoveIfExpired, updateFileAttempts } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { verifyPassword } from '@/lib/hash'
import { StorageConfigurationError } from '@/lib/objectStorage'

const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    const record = await checkAndRemoveIfExpired(id)

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
      await updateFileAttempts(id, newAttempts, newLockedAt)
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

    if (typeof password !== 'string' || !record.hash) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }
    const valid = await verifyPassword(password, record.hash)
    if (!valid) {
      const newAttempts = record.attempts + 1
      const newLockedAt = newAttempts >= 3 ? Date.now() : record.lockedAt
      await updateFileAttempts(id, newAttempts, newLockedAt)
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

    await updateFileAttempts(id, 0, null)
    return NextResponse.json({ success: true, attemptsLeft: 3 })
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    throw error
  }
}
