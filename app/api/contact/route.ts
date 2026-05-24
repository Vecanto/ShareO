import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, topic, query } = body

    if (!name?.trim() || !email?.trim() || !topic?.trim() || !query?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Forward to Formspree (or swap with any email service like Resend, SendGrid)
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT
    if (!formspreeEndpoint) {
      // Gracefully succeed in dev if not configured
      console.log('[Contact Form]', { name, email, topic, query })
      return NextResponse.json({ success: true })
    }

    const res = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, topic, message: query }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
