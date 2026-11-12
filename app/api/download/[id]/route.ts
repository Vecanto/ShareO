import { NextRequest, NextResponse } from 'next/server'
import { checkAndRemoveIfExpired, updateFileAttempts } from '@/lib/fileStore'
import { isLockedOut, getUnlockTime } from '@/lib/lockout'
import { verifyPassword } from '@/lib/hash'
import { downloadObject, StorageConfigurationError } from '@/lib/objectStorage'

const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30')

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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

    if (record.hash) {
      const password = request.headers.get('x-file-password')
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 })
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
          error: 'Invalid password',
          attemptsLeft: Math.max(0, 3 - newAttempts)
        }, { status: 401 })
      }
      await updateFileAttempts(id, 0, null)
    }

    const storedFile = await downloadObject(record.storedName)
    if (!storedFile) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    return new NextResponse(storedFile.body, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(record.originalName)}"`,
        'Content-Type': storedFile.contentType || record.contentType || 'application/octet-stream',
      },
    })
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      '$metadata' in error &&
      typeof error.$metadata === 'object' &&
      error.$metadata !== null &&
      'httpStatusCode' in error.$metadata &&
      error.$metadata.httpStatusCode === 404
    ) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
