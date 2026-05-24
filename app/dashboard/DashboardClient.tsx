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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {files.map((file) => (
        <div 
          key={file.id} 
          style={{ 
            padding: '20px', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            background: 'var(--bg-2)',
            opacity: file.isExpired ? 0.6 : 1
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', wordBreak: 'break-all' }}>
                📄 {file.originalName}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                {file.isExpired 
                  ? <span style={{ color: 'var(--error)' }}>Expired on {new Date(file.expiresAt).toLocaleString()}</span>
                  : <span>Valid until {new Date(file.expiresAt).toLocaleString()}</span>
                }
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {!file.isExpired && (
                <>
                  <Link 
                    href={`/download/${file.id}`} 
                    target="_blank"
                    style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid var(--border-2)', borderRadius: '4px', color: 'var(--text-2)' }}
                  >
                    Open
                  </Link>
                  <button 
                    onClick={() => handleCopyLink(file.id)}
                    style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--border-2)', borderRadius: '4px', color: 'var(--text)' }}
                  >
                    {copiedLink === file.id ? 'Copied!' : 'Copy Link'}
                  </button>
                </>
              )}
            </div>
          </div>

          {file.password && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password:</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', minWidth: '80px', letterSpacing: visiblePasswords[file.id] ? 'normal' : '0.2em' }}>
                  {visiblePasswords[file.id] ? file.password : '••••••••'}
                </span>
              </div>
              <button 
                onClick={() => togglePassword(file.id)}
                style={{ fontSize: '12px', color: 'var(--blue-text)' }}
              >
                {visiblePasswords[file.id] ? 'Hide' : 'View'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
