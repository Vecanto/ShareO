'use client'

import Link from 'next/link'

const sections = [
  {
    title: 'Introduction',
    content:
      'ShareO is a dead-simple, no-signup file transfer tool. Upload any file up to 100MB, get a shareable link instantly, and send it to anyone. No accounts, no tracking, no clutter. Files expire automatically after 24 hours and are wiped from storage.',
  },
  {
    title: 'How It Works',
    content:
      'Drag a file into the drop zone (or click to browse), optionally add a password, and hit Upload. You get a unique link you can copy and share. The recipient opens the link, enters the password if required, and downloads the file directly. Everything happens in the browser.',
  },
  {
    title: 'Password Protection',
    content:
      'You can optionally protect any upload with a password. Passwords are hashed with bcrypt (salt rounds 10) before storage. The recipient must enter the correct password to download. After 3 failed attempts, the file is locked for 30 minutes to prevent brute-force attacks.',
  },
  {
    title: 'File Expiry & Cleanup',
    content:
      'Every uploaded file has a fixed lifespan of 24 hours from the moment it is uploaded. After expiry, the file is permanently deleted from both cloud storage and the database. A background cleanup job runs periodically to remove expired files automatically.',
  },
  {
    title: 'Security',
    content:
      'ShareO blocks executable and script file uploads (.exe, .bat, .sh, .ps1, .py, .jar, and more). The API is rate-limited to 100 requests per 15 minutes and 20 uploads per hour per IP. Helmet security headers and CORS origin restrictions are enforced in production.',
  },
  {
    title: 'Limits & Fair Use',
    content:
      'Max file size: 100MB per upload. Max failed password attempts: 3 per file (then 30-minute lockout). Files live for 24 hours only. There is no user authentication — the service is open to anyone, so please do not use it for illegal or harmful content.',
  },
  {
    title: 'Tech Stack',
    content:
      'Frontend: Next.js + React, vanilla CSS, hosted via Vercel. Backend: Next.js API Routes, bcrypt for password hashing, UUID v4 for link generation, better-sqlite3 for metadata, Supabase Storage for files.',
  },
  {
    title: 'Privacy',
    content:
      'We do not track users, require logins, or store personal data. Only the file, its optional password hash, and an expiry timestamp are kept. Once a file expires or is deleted, all traces are removed. We cannot recover expired files.',
  },
  {
    title: 'FAQ',
    content:
      'Do I need an account? No. Can I recover an expired file? No. Can I change the expiry time? Not as a user — it is fixed at 24 hours. What happens if I forget the password? The file cannot be downloaded without it. Is there a download speed limit? No, downloads stream directly from cloud storage.',
  },
]

export default function About() {
  return (
    <div className="ab">
      <aside className="ab-sidebar">
        <div className="ab-logo">ShareO</div>
        <nav className="ab-nav" aria-label="Documentation sections">
          {sections.map((section) => (
            <a key={section.title} href={`#${section.title.toLowerCase().replace(/ &amp; /g, '-').replace(/ /g, '-')}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <main className="ab-content">
        <div className="ab-hero">
          <span className="ab-badge">Documentation</span>
          <h1>ShareO Documentation</h1>
          <p>
            Everything you need to know about ShareO — how to upload, share,
            protect, and download files. No accounts. No tracking. Just links.
          </p>
        </div>

        <div className="ab-tagline">
          ShareO is just getting started. You may run into a bug or two — if
          you spot anything off, please report it on our{' '}
          <Link href="/connect">Connect page</Link>. We read every message.
        </div>

        <div className="ab-cards">
          <div className="ab-card">
            <h3>No Signup</h3>
            <p>Upload instantly without creating an account or verifying an email.</p>
          </div>
          <div className="ab-card">
            <h3>Password Protected</h3>
            <p>Optional bcrypt-hashed passwords with brute-force lockout protection.</p>
          </div>
          <div className="ab-card">
            <h3>Auto Expiry</h3>
            <p>Files live for 24 hours, then are permanently wiped from storage.</p>
          </div>
        </div>

        {sections.map((section) => (
          <section
            className="ab-section"
            key={section.title}
            id={section.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}
          >
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </section>
        ))}

        <footer className="ab-footer">© {new Date().getFullYear()} ShareO. All rights reserved.</footer>
      </main>
    </div>
  )
}