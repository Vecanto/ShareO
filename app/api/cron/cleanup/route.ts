import { NextResponse } from 'next/server'
import { deleteExpiredFiles } from '@/lib/fileStore'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Scheduled cleanup is not configured' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteExpiredFiles()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expired file cleanup failed:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
