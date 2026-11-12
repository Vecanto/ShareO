import { getPrismaClient } from '@/lib/prisma'
import { deleteObject } from '@/lib/objectStorage'

export type NewFileRecord = {
  userId: string | null
  originalName: string
  storedName: string
  hash: string | null
  attempts: number
  lockedAt: number | null
  expiresAt: number
  sizeBytes: number
  contentType: string
}

export async function getFile(id: string) {
  const file = await getPrismaClient().fileShare.findUnique({ where: { id } })
  if (!file) return null

  return {
    id: file.id,
    userId: file.userId,
    originalName: file.originalName,
    storedName: file.storedName,
    hash: file.password,
    attempts: file.attempts,
    lockedAt: file.lockedAt?.getTime() ?? null,
    expiresAt: file.expiresAt.getTime(),
    sizeBytes: file.sizeBytes,
    contentType: file.contentType,
    createdAt: file.createdAt.toISOString(),
  }
}

export async function addFile(id: string, record: NewFileRecord) {
  await getPrismaClient().fileShare.create({
    data: {
      id,
      userId: record.userId,
      originalName: record.originalName,
      storedName: record.storedName,
      password: record.hash,
      attempts: record.attempts,
      lockedAt: record.lockedAt === null ? null : new Date(record.lockedAt),
      expiresAt: new Date(record.expiresAt),
      sizeBytes: record.sizeBytes,
      contentType: record.contentType,
    },
  })
}

export async function removeFile(id: string) {
  const record = await getFile(id)
  if (!record) return

  await deleteObject(record.storedName)
  await getPrismaClient().fileShare.deleteMany({ where: { id } })
}

export async function updateFileAttempts(
  id: string,
  attempts: number,
  lockedAt: number | null,
) {
  await getPrismaClient().fileShare.update({
    where: { id },
    data: {
      attempts,
      lockedAt: lockedAt === null ? null : new Date(lockedAt),
    },
  })
}

export async function checkAndRemoveIfExpired(id: string) {
  const record = await getFile(id)
  if (!record) return null
  if (Date.now() >= record.expiresAt) {
    await removeFile(id)
    return null
  }
  return record
}

export async function deleteExpiredFiles() {
  const now = new Date()
  const expired = await getPrismaClient().fileShare.findMany({
    where: { expiresAt: { lte: now } },
    select: { id: true, storedName: true },
  })

  for (const file of expired) {
    await deleteObject(file.storedName)
  }

  if (expired.length > 0) {
    await getPrismaClient().fileShare.deleteMany({
      where: { id: { in: expired.map((file) => file.id) } },
    })
  }
}
