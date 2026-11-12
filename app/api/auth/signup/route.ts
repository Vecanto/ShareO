import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BCRYPT_MAX_BYTES = 72

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password } = body as { email?: unknown; password?: unknown }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
    return NextResponse.json({ error: 'Password must be 8-72 bytes long' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  try {
    await getPrismaClient().user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true },
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    throw error
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
