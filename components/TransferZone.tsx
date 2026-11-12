'use client'

import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'

const MAX_FILE_SIZE_MB = 100

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

function formatExpiry(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

export default function TransferZone() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    setFile(f)
    setResult(null)
    setError('')
    setProgress(0)
    setCopied(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) selectFile(f)
  }, [selectFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) selectFile(f)
  }

  const handleUpload = () => {
    if (!file) { setError('Please select a file first'); return }
    setUploading(true)
    setError('')
    setProgress(0)
    setCopied(false)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      setUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        setResult(data)
        setFile(null)
        setPassword('')
        setProgress(0)
        if (inputRef.current) inputRef.current.value = ''
      } else {
        let msg = 'Upload failed'
        try { const data = JSON.parse(xhr.responseText); if (data.error) msg = data.error } catch {}
        if (xhr.status === 413) msg = `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
        if (xhr.status === 429) msg = 'Upload limit reached. Please try again later.'
        setError(msg)
        setProgress(0)
      }
    })

    xhr.addEventListener('error', () => {
      setUploading(false)
      setError('Upload failed. Please check your connection and try again.')
      setProgress(0)
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  }

  const handleCopy = () => {
    if (result?.link) {
      navigator.clipboard.writeText(result.link).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <main className="transfer-shell">
      <section className="hero-copy">
        <h1>Send a file.<br />Pass the link on.</h1>
        <p>
          Choose a file, add a password if you like, and share its link. Each transfer
          expires after 24 hours.
        </p>

        <div className="hero-actions">
          <a href="#transfer" className="primary-cta">
            Start a handoff
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </a>
          <Link href="/about" className="secondary-cta">How it works</Link>
        </div>

        <dl className="handoff-facts">
          <div>
            <dt>File limit</dt>
            <dd>100 MB</dd>
          </div>
          <div>
            <dt>Link lifetime</dt>
            <dd>24 hours</dd>
          </div>
          <div>
            <dt>Protection</dt>
            <dd>Optional password</dd>
          </div>
        </dl>

        <div className="account-route">
          <span>Keeping track of your transfers?</span>
          <Link href="/login">Open your file register</Link>
        </div>
      </section>

      <section className="transfer-zone" id="transfer">
        <div className="transfer-zone-header">
          <div>
            <h2 className="transfer-zone-heading">Create a handoff</h2>
            <p className="transfer-zone-sub">Choose a file to begin.</p>
          </div>
          <span className="due-stamp">Expires in 24 hours</span>
        </div>

        <div
          className={`drop-area ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="File drop zone, click or drag a file here"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        >
          {file ? (
            <div className="selected-file">
              <svg className="file-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 3.75h6.2L18 8.6v11.65H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" />
                <path d="M13 4v5h5M8.5 13h6M8.5 16h6" />
              </svg>
              <span className="file-summary">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
              </span>
              <span className="file-change">Replace</span>
            </div>
          ) : (
            <div className="drop-prompt">
              <svg className="drop-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 21V5m0 0-6 6m6-6 6 6M6 20v6h20v-6" />
              </svg>
              <p className="drop-title">Drop a file to begin</p>
              <p className="drop-hint">or browse from your device</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            className="file-input"
            onChange={handleFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        <div className="password-field">
          <label htmlFor="upload-password">
            <span>Password protection</span>
            <span className="optional-label">Optional</span>
          </label>
          <input
            id="upload-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank for no password"
            disabled={uploading}
            autoComplete="new-password"
          />
        </div>

        <button className="upload-btn" onClick={handleUpload} disabled={uploading || !file} type="button">
          {uploading ? `Uploading ${progress}%` : 'Upload & create link'}
        </button>

        {uploading && (
          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        )}

        {error && <p className="error-text" role="alert">{error}</p>}

        {result && (
          <div className="result-box" aria-live="polite">
            <div className="result-heading">
              <h3>Link ready to share</h3>
              <span className="due-stamp due-stamp-ready">Ready</span>
            </div>
            <div className="link-row">
              <input type="text" readOnly value={result.link} aria-label="Shareable file link" />
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button">
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <dl className="meta-row">
              <div><dt>File</dt><dd>{result.originalName}</dd></div>
              <div><dt>Size</dt><dd>{result.size}</dd></div>
              <div><dt>Expires</dt><dd>{formatExpiry(result.expiresAt)}</dd></div>
            </dl>
          </div>
        )}
      </section>
    </main>
  )
}
