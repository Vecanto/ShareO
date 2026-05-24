'use client'

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
    <section className="transfer-zone">
      <h1 className="transfer-zone-heading">Transfer a file</h1>
      <p className="transfer-zone-sub">No sign-up. Files expire in 24 hours. Up to {MAX_FILE_SIZE_MB}MB.</p>

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
          <>
            <p className="file-name">📄 {file.name}</p>
            <p className="file-size">{formatSize(file.size)}</p>
          </>
        ) : (
          <>
            <div className="drop-icon">⬆</div>
            <p>Drag &amp; drop a file here, or click to select</p>
          </>
        )}
        <input ref={inputRef} type="file" className="file-input" onChange={handleFileChange} aria-hidden="true" />
      </div>

      <div className="password-field">
        <label htmlFor="upload-password">Password protection (optional)</label>
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

      <button className="upload-btn" onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? `Uploading… ${progress}%` : 'Upload & get link'}
      </button>

      {uploading && (
        <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="error-text" role="alert">{error}</p>}

      {result && (
        <div className="result-box">
          <div className="link-row">
            <input type="text" readOnly value={result.link} aria-label="Shareable file link" />
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
          </div>
          <div className="meta-row">
            <div>File: <span>{result.originalName}</span></div>
            <div>Size: <span>{result.size}</span></div>
            <div>Expires: <span>{formatExpiry(result.expiresAt)}</span></div>
          </div>
        </div>
      )}
    </section>
  )
}
