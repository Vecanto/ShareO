'use client'

import Link from 'next/link'

const sectionId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const sections = [
  {
    title: 'Introduction',
    content:
      'ShareO lets you send a file without creating an account. Choose a file up to 100 MB, optionally add a password, and share the link. Links expire after 24 hours.',
  },
  {
    title: 'How It Works',
    content:
      'Drag a file into the drop zone or browse from your device. Add a password if you want one, then upload to create a shareable link. The recipient opens that link and enters the password before downloading when protection is enabled.',
  },
  {
    title: 'Password Protection',
    content:
      'You can add a password when uploading. Recipients must enter it before downloading a protected file. Repeated incorrect attempts temporarily lock access to the link.',
  },
  {
    title: 'File Expiry',
    content:
      'Each link has a 24-hour lifetime. After it expires, it can no longer be used to download the file.',
  },
  {
    title: 'Limits & Fair Use',
    content:
      'Each upload can be up to 100 MB. Files expire after 24 hours, and password protection is optional.',
  },
  {
    title: 'Your File Register',
    content:
      'The dashboard lists files uploaded while signed in. For active files, you can open or copy the share link and review the expiry and password status.',
  },
  {
    title: 'FAQ',
    content:
      'Do I need an account to send a file? No. Can I add a password? Yes, it is optional. How long does a link last? 24 hours. Can I use an expired link? No.',
  },
]

export default function About() {
  return (
    <div className="ab">
      <aside className="ab-sidebar">
        <div className="ab-logo">ShareO</div>
        <nav className="ab-nav" aria-label="Documentation sections">
          {sections.map((section) => (
            <a key={section.title} href={`#${sectionId(section.title)}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <main className="ab-content">
        <div className="ab-hero">
          <h1>ShareO Documentation</h1>
          <p>
            A quick guide to choosing a file, sharing its link, and knowing when it expires.
          </p>
        </div>

        <div className="ab-tagline">
          Need help with a handoff? Send a note through our{' '}
          <Link href="/connect">Connect page</Link>.
        </div>

        <dl className="ab-facts">
          <div><dt>File limit</dt><dd>100 MB per upload</dd></div>
          <div><dt>Password</dt><dd>Optional on upload</dd></div>
          <div><dt>Link lifetime</dt><dd>24 hours</dd></div>
        </dl>

        {sections.map((section) => (
          <section
            className="ab-section"
            key={section.title}
            id={sectionId(section.title)}
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