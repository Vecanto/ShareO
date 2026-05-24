import { supabase } from '@/lib/supabase'

export async function getFile(id: string) {
  const { data, error } = await supabase.from('files').select('*').eq('id', id).single()
  if (error || !data) return null
  return {
    id: data.id,
    user_id: data.user_id,
    originalName: data.original_name,
    storedName: data.stored_name,
    hash: data.password, 
    attempts: data.attempts,
    lockedAt: data.locked_at,
    expiresAt: data.expires_at,
  }
}

export async function addFile(id: string, record: any) {
  await supabase.from('files').insert({
    id,
    user_id: record.user_id || null,
    original_name: record.originalName,
    stored_name: record.storedName,
    password: record.hash || null,
    attempts: record.attempts || 0,
    locked_at: record.lockedAt || null,
    expires_at: record.expiresAt,
  })
}

export async function removeFile(id: string) {
  const record = await getFile(id)
  if (record) {
    await supabase.storage.from('uploads').remove([record.storedName])
    await supabase.from('files').delete().eq('id', id)
  }
}

export async function updateFileAttempts(id: string, attempts: number, lockedAt: number | null) {
  await supabase.from('files').update({
    attempts,
    locked_at: lockedAt
  }).eq('id', id)
}

export async function checkAndRemoveIfExpired(id: string, fileExpiryHours: number) {
  const record = await getFile(id)
  if (!record) return null
  const now = Date.now()
  if (now >= record.expiresAt) {
    await removeFile(id)
    return null
  }
  return record
}

// Background cron job to delete expired files
export async function deleteExpiredFiles() {
  const now = Date.now()
  const { data } = await supabase.from('files').select('id, stored_name').lte('expires_at', now)
  if (data && data.length > 0) {
    const paths = data.map(r => r.stored_name)
    await supabase.storage.from('uploads').remove(paths)
    await supabase.from('files').delete().in('id', data.map(r => r.id))
  }
}
