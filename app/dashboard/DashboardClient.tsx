'use client'

import { useState } from 'react'
import Link from 'next/link'

type FileData = {
  id: string
  originalName: string
  createdAt: string
  expiresAt: number
  isExpired: boolean
  password: string | null
}

export default function DashboardClient({ files }: { files: FileData[] }) {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({})
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/download/${id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(id)
      setTimeout(() => setCopiedLink(null), 2000)
    })
  }

  return (
    <div className="file-register">
      {files.map((file) => (
        <article className={`file-record ${file.isExpired ? 'file-record-expired' : ''}`} key={file.id}>
          <div className="file-record-main">
            <div className="file-record-title">
              <span className="file-record-index" aria-hidden="true">FILE</span>
              <h2>{file.originalName}</h2>
            </div>
            <div className="file-record-actions">
              {!file.isExpired && (
                <>
                  <Link
                    href={`/download/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="record-action"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleCopyLink(file.id)}
                    className="record-action record-action-primary"
                    type="button"
                  >
                    {copiedLink === file.id ? 'Copied' : 'Copy link'}
                  </button>
                </>
              )}
            </div>
          </div>

          <dl className="file-record-details">
            <div>
              <dt>Expires</dt>
              <dd className={file.isExpired ? 'record-expired' : ''}>
                {new Date(file.expiresAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt>Protection</dt>
              <dd>{file.password ? 'Password protected' : 'No password'}</dd>
            </div>
          </dl>

          {file.password && (
            <div className="password-record">
              <span className="password-record-label">Password</span>
              <span className={`password-value ${visiblePasswords[file.id] ? 'password-value-visible' : ''}`}>
                  {visiblePasswords[file.id] ? file.password : '••••••••'}
              </span>
              <button
                onClick={() => togglePassword(file.id)}
                className="password-toggle"
                type="button"
                aria-pressed={Boolean(visiblePasswords[file.id])}
              >
                {visiblePasswords[file.id] ? 'Hide' : 'Reveal'}
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
