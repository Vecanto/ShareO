'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Email validation
  useEffect(() => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setEmailValid(isValid)
  }, [email])

  // Password strength check
  useEffect(() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [password])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!emailValid) {
      setError('Please enter a valid email address')
      return
    }

    if (isSignUp) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (passwordStrength < 2) {
        setError('Password is too weak. Use uppercase, numbers, and symbols')
        return
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setSuccess('Account created! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password')
          }
          throw error
        }
        setSuccess('Logged in! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed'
      setError(msg.includes('rate') ? 'Too many attempts. Please wait before trying again.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Animated background elements */}
        <div className={styles.gradientBg}></div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className={styles.subtitle}>
              {isSignUp
                ? 'Join us and manage your secure file transfers'
                : 'Sign in to your account'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleAuth}>
            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  className={`${styles.input} ${emailValid && email ? styles.valid : ''}`}
                />
                {email && (
                  <span className={styles.icon}>
                    {emailValid ? '✓' : '✕'}
                  </span>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
                  required
                  disabled={loading}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator (Sign Up) */}
              {isSignUp && password && (
                <div className={styles.strengthContainer}>
                  <div className={styles.strengthBars}>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`${styles.bar} ${
                          i < passwordStrength ? styles.active : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel}>
                    {passwordStrength === 0 && 'Weak'}
                    {passwordStrength === 1 && 'Fair'}
                    {passwordStrength === 2 && 'Good'}
                    {passwordStrength === 3 && 'Strong'}
                    {passwordStrength === 4 && 'Very Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up) */}
            {isSignUp && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    className={`${styles.input} ${
                      confirmPassword && password === confirmPassword
                        ? styles.valid
                        : confirmPassword
                        ? styles.invalid
                        : ''
                    }`}
                  />
                  {confirmPassword && (
                    <span className={styles.icon}>
                      {password === confirmPassword ? '✓' : '✕'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={styles.alert} role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={`${styles.alert} ${styles.success}`} role="status">
                <span>✓</span> {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !emailValid || (isSignUp && !password)}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className={styles.footer}>
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className={styles.toggleLink}
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
