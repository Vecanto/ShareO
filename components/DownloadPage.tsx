'use client'

import { useState, useEffect, useCallback } from 'react'

export default function DownloadPage({ id }: { id: string }) {
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [locked, setLocked] = useState(false)
  const [unlockAt, setUnlockAt] = useState<number | null>(null)
  const [countdown, setCountdown] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch(`/api/meta/${id}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'File not found or expired')
      } else {
        setMeta(data)
        setAttemptsLeft(data.attemptsLeft)
        setLocked(data.locked)
        setUnlockAt(data.unlockAt || null)
      }
    } catch {
      setError('Failed to load file. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchMeta() }, [fetchMeta])

  useEffect(() => {
    if (!locked || !unlockAt) { setCountdown(''); return }
    const update = () => {
      const diff = unlockAt - Date.now()
      if (diff <= 0) { setLocked(false); setUnlockAt(null); setCountdown(''); fetchMeta(); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [locked, unlockAt, fetchMeta])

  const triggerDownload = (pw?: string) => {
    setDownloading(true)
    setDownloadProgress(0)
    setVerifyError('')

    const xhr = new XMLHttpRequest()

    xhr.addEventListener('progress', (e) => {
      if (e.lengthComputable) setDownloadProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      setDownloading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = new Blob([xhr.response])
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = meta?.originalName || 'download'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        setDownloadProgress(0)
      } else {
        let data: any = {}
        try { data = JSON.parse(xhr.responseText) } catch {}
        if (xhr.status === 423) {
          setLocked(true)
          setUnlockAt(data.unlockAt || null)
          setVerifyError('Too many failed attempts. File is locked.')
        } else if (xhr.status === 401) {
          setAttemptsLeft(data.attemptsLeft ?? 0)
          setVerifyError(`Incorrect password. ${data.attemptsLeft ?? 0} attempt${data.attemptsLeft === 1 ? '' : 's'} remaining.`)
        } else {
          setVerifyError(data.error || 'Download failed. Please try again.')
        }
        setDownloadProgress(0)
      }
    })

    xhr.addEventListener('error', () => {
      setDownloading(false)
      setVerifyError('Download failed. Please check your connection.')
      setDownloadProgress(0)
    })

    xhr.open('GET', `/api/download/${id}`)
    xhr.responseType = 'blob'
    if (pw) xhr.setRequestHeader('x-file-password', pw)
    xhr.send()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setVerifyError('Please enter the password'); return }
    setVerifying(true)
    setVerifyError('')
    try {
      const res = await fetch(`/api/verify/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 423) {
          setLocked(true)
          setUnlockAt(data.unlockAt || null)
          setVerifyError('Too many failed attempts. File is locked.')
        } else {
          setAttemptsLeft(data.attemptsLeft ?? 0)
          setVerifyError(`Incorrect password. ${data.attemptsLeft ?? 0} attempt${data.attemptsLeft === 1 ? '' : 's'} remaining.`)
        }
        setVerifying(false)
        return
      }
      if (data.success) triggerDownload(password.trim())
    } catch {
      setVerifyError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const formatExpiry = (timestamp: number) => new Date(timestamp).toLocaleString()

  if (loading) {
    return (
      <div className="download-page">
        <div className="download-card" style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="not-found">
        <h2>File Not Found</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="download-page">
      <div className="download-card">
        <h2>Download File</h2>
        <div className="file-info">
          <p className="name">📄 {meta.originalName}</p>
          <p className="size">
            {meta.size !== 'Unknown size' ? `${meta.size} · ` : ''}
            Expires {formatExpiry(meta.expiresAt)}
          </p>
        </div>

        {locked ? (
          <div className="lockout-message">
            <h3>File Locked</h3>
            <p>Too many failed password attempts.</p>
            {countdown && <p style={{ marginTop: '0.625rem', fontWeight: 500, color: 'var(--text-2)' }}>Unlocks in {countdown}</p>}
          </div>
        ) : meta.passwordProtected ? (
          <>
            <form className="password-form" onSubmit={handleVerify}>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={verifying || downloading}
                autoComplete="current-password"
                aria-label="File password"
              />
              <button type="submit" disabled={verifying || downloading}>
                {verifying ? 'Verifying…' : downloading ? `Downloading ${downloadProgress}%` : 'Download'}
              </button>
            </form>
            {downloading && (
              <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
              </div>
            )}
            <p className={`attempts-text ${attemptsLeft <= 1 ? 'warning' : ''}`}>
              {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
            </p>
            {verifyError && <p className="error-text" role="alert" style={{ textAlign: 'center', marginTop: '0.75rem' }}>{verifyError}</p>}
          </>
        ) : (
          <>
            <button
              className="download-btn"
              onClick={() => triggerDownload()}
              disabled={downloading}
            >
              {downloading ? `Downloading ${downloadProgress}%` : 'Download'}
            </button>
            {downloading && (
              <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
              </div>
            )}
            {verifyError && <p className="error-text" role="alert" style={{ textAlign: 'center', marginTop: '0.75rem' }}>{verifyError}</p>}
          </>
        )}
      </div>
    </div>
  )
}
