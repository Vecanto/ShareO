import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '@/lib/hash'
import { addFile } from '@/lib/fileStore'
import { getFileSizeString } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { deleteObject, StorageConfigurationError, uploadObject } from '@/lib/objectStorage'

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100')
const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '24')
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const dangerousExts = [
  '.exe', '.dll', '.bat', '.sh', '.cmd', '.msi', '.app', '.dmg',
  '.ps1', '.vbs', '.jar', '.py', '.rb', '.pl', '.php', '.com', '.scr'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const passwordValue = formData.get('password')
    const password = typeof passwordValue === 'string' ? passwordValue : ''

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.` }, { status: 413 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (dangerousExts.includes(ext)) {
      return NextResponse.json({ error: 'Executable or script files are not allowed' }, { status: 400 })
    }

    const id = uuidv4()
    const storedName = uuidv4() + ext
    const session = await getServerSession(authOptions)
    const now = Date.now()
    const expiresAt = now + FILE_EXPIRY_HOURS * 60 * 60 * 1000

    let hash = null
    if (password.trim().length > 0) {
      hash = await hashPassword(password.trim())
    }

    await uploadObject(
      storedName,
      new Uint8Array(await file.arrayBuffer()),
      file.type || 'application/octet-stream',
    )
    try {
      await addFile(id, {
        userId: session?.user.id ?? null,
        originalName: file.name,
        storedName,
        hash,
        attempts: 0,
        lockedAt: null,
        expiresAt,
        sizeBytes: file.size,
        contentType: file.type || 'application/octet-stream',
      })
    } catch (error) {
      try {
        await deleteObject(storedName)
      } catch (cleanupError) {
        console.error('Failed to clean up an upload after its database insert failed:', cleanupError)
      }
      throw error
    }

    const link = `${BASE_URL}/download/${id}`

    return NextResponse.json({
      id,
      link,
      originalName: file.name,
      size: getFileSizeString(file.size),
      expiresAt
    })
  } catch (err) {
    if (err instanceof StorageConfigurationError) {
      return NextResponse.json({ error: err.message }, { status: 503 })
    }
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
