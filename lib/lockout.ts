export function isLockedOut(record: any, lockoutDurationMinutes: number) {
  if (!record.lockedAt) return false
  const lockoutMs = lockoutDurationMinutes * 60 * 1000
  const now = Date.now()
  return now - record.lockedAt < lockoutMs
}

export function getUnlockTime(record: any, lockoutDurationMinutes: number) {
  if (!record.lockedAt) return null
  const lockoutMs = lockoutDurationMinutes * 60 * 1000
  return record.lockedAt + lockoutMs
}
