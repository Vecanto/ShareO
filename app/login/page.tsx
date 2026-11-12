'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
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
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Unable to create account')
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        throw new Error(isSignUp ? 'Account created, but sign-in failed. Please sign in.' : 'Invalid email or password')
      }

      setSuccess(isSignUp ? 'Account created! Redirecting...' : 'Logged in! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, isSignUp ? 1500 : 1000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
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
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className={styles.subtitle}>
              {isSignUp
                ? 'Create an account to manage your shared files'
                : 'Sign in to your account'}
            </p>
          </div>

          <>
              <form className={styles.form} onSubmit={handleAuth}>
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
                      <span className={`${styles.validationLabel} ${emailValid ? styles.valid : styles.invalid}`}>
                        {emailValid ? 'Valid' : 'Review'}
                      </span>
                    )}
                  </div>
                </div>

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
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {isSignUp && password && (
                    <div className={styles.strengthContainer}>
                      <div className={styles.strengthBars}>
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`${styles.bar} ${i < passwordStrength ? styles.active : ''}`}
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
                        <span className={`${styles.validationLabel} ${password === confirmPassword ? styles.valid : styles.invalid}`}>
                          {password === confirmPassword ? 'Match' : 'No match'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className={styles.alert} role="alert">
                    <span className={styles.alertLabel}>Notice</span> {error}
                  </div>
                )}

                {success && (
                  <div className={`${styles.alert} ${styles.success}`} role="status">
                    <span className={styles.alertLabel}>Done</span> {success}
                  </div>
                )}

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
          </>
        </div>
      </div>
    </div>
  )
}
