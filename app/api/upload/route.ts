import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '@/lib/hash'
import { addFile } from '@/lib/fileStore'
import { getFileSizeString } from '@/lib/utils'
import { createClient } from '@/utils/supabase/server'

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
    const file = formData.get('file') as File
    const password = (formData.get('password') as string) || ''

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    const user_id = user?.id || null

    if (!file) {
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

    const bytes = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('uploads')
      .upload(storedName, bytes, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    const now = Date.now()
    const expiresAt = now + FILE_EXPIRY_HOURS * 60 * 60 * 1000

    let hash = null
    if (password.trim().length > 0) {
      hash = await hashPassword(password.trim())
    }

    await addFile(id, {
      user_id,
      originalName: file.name,
      storedName,
      hash,
      attempts: 0,
      lockedAt: null,
      expiresAt
    })

    const link = `${BASE_URL}/download/${id}`

    return NextResponse.json({
      id,
      link,
      originalName: file.name,
      size: getFileSizeString(file.size),
      expiresAt
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
