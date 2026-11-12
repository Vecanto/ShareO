import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageConfigurationError'
  }
}

type S3Storage = { client: S3Client; bucket: string }

let storage: S3Storage | undefined

function getStorage(): S3Storage {
  if (storage) return storage

  const region = process.env.S3_REGION?.trim()
  const bucket = process.env.S3_BUCKET?.trim()
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim()
  const endpoint = process.env.S3_ENDPOINT?.trim()
  const missing = [
    ['S3_REGION', region],
    ['S3_BUCKET', bucket],
    ['S3_ACCESS_KEY_ID', accessKeyId],
    ['S3_SECRET_ACCESS_KEY', secretAccessKey],
  ].filter(([, value]) => !value).map(([name]) => name)

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new StorageConfigurationError(
      `S3 storage is not configured. Set ${missing.join(', ')}.`,
    )
  }

  if (endpoint) {
    try {
      const parsedEndpoint = new URL(endpoint)
      if (parsedEndpoint.protocol !== 'http:' && parsedEndpoint.protocol !== 'https:') {
        throw new Error('Unsupported protocol')
      }
    } catch {
      throw new StorageConfigurationError('S3_ENDPOINT must be an HTTP or HTTPS URL.')
    }
  }

  storage = {
    client: new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId, secretAccessKey },
    }),
    bucket,
  }
  return storage
}

export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string,
) {
  const { client, bucket } = getStorage()
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }))
}

export async function downloadObject(key: string) {
  const { client, bucket } = getStorage()
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!result.Body) return null

  return {
    body: result.Body.transformToWebStream(),
    contentType: result.ContentType,
  }
}

export async function deleteObject(key: string) {
  const { client, bucket } = getStorage()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
