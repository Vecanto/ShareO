'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        // Supabase auto-logins after signup if email confirmations are disabled
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cn">
      <div className="cn-inner">
        <h1 className="cn-title">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
        <p className="cn-desc">
          {isSignUp
            ? 'Sign up to track your uploads and manage your passwords.'
            : 'Log in to view your file transfer history.'}
        </p>

        <form className="cn-form" onSubmit={handleAuth}>
          <div className="cn-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="cn-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          {error && <p className="cn-error-msg">{error}</p>}
          
          <button type="submit" className="cn-submit-btn" disabled={loading}>
            {loading ? 'Processing…' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{ fontSize: '13px', color: 'var(--blue-text)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isSignUp ? 'Already have an account? Log in' : 'Don\'t have an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
