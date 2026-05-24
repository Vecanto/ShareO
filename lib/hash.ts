import crypto from 'crypto'

// Use a 32-byte key from env, or a fallback for dev
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'shareo-dev-key-must-be-32-bytes-!' 
const IV_LENGTH = 16

export async function hashPassword(text: string): Promise<string> {
  // We use AES symmetric encryption instead of bcrypt so we can decrypt it later
  // for the user dashboard.
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const textParts = hash.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString() === password
  } catch (e) {
    return false
  }
}

export function decryptPasswordSync(hash: string): string {
  if (!hash) return ''
  try {
    const textParts = hash.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (e) {
    return ''
  }
}
