import { NextRequest, NextResponse } from 'next/server'
import { checkAndRemoveIfExpired } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { getFileSizeString } from '@/lib/utils'
import { StorageConfigurationError } from '@/lib/objectStorage'

const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    const record = await checkAndRemoveIfExpired(id)

    if (!record) {
      return NextResponse.json({ error: 'File not found or expired' }, { status: 404 })
    }

    const locked = isLockedOut(record, LOCKOUT_DURATION_MINUTES)
    const attemptsLeft = 3 - record.attempts
    const unlockAt = locked ? getUnlockTime(record, LOCKOUT_DURATION_MINUTES) : undefined

    return NextResponse.json({
      id,
      originalName: record.originalName,
      size: getFileSizeString(record.sizeBytes),
      expiresAt: record.expiresAt,
      passwordProtected: !!record.hash,
      locked,
      attemptsLeft: locked ? 0 : Math.max(0, attemptsLeft),
      unlockAt
    })
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    throw error
  }
}
