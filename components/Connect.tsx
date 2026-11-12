'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Connect() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: '', query: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const openModal = () => { setModalOpen(true); setSubmitted(false); setSubmitError('') }
  const closeModal = () => { setModalOpen(false); setForm({ name: '', email: '', topic: '', query: '' }); setSubmitted(false); setSubmitError('') }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error || 'Failed to send message. Please try again.')
      } else {
        setSubmitted(true)
        setTimeout(closeModal, 2500)
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="cn">
        <div className="cn-inner">
          <h1 className="cn-title">Connect</h1>
          <p className="cn-desc">Have questions or feedback? Reach out through the channels below.</p>

          <div className="cn-links">
            <a href="mailto:scalpxnaved@gmail.com" className="cn-link-item">
              <span className="cn-link-label">Email</span>
              <svg className="cn-link-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 12 12 4M5 4h7v7" />
              </svg>
            </a>
            <a href="https://github.com/Vecanto" target="_blank" rel="noopener noreferrer" className="cn-link-item">
              <span className="cn-link-label">GitHub</span>
              <svg className="cn-link-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 12 12 4M5 4h7v7" />
              </svg>
            </a>
            <button onClick={openModal} className="cn-link-item">
              <span className="cn-link-label">Send a message</span>
              <svg className="cn-link-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 8h8M8 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          <div className="cn-footer">
            <span className="cn-footer-note">Files expire after 24 hours</span>
            <Link href="/" className="cn-footer-link">Back to home</Link>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <div
        className={`cn-modal-overlay ${modalOpen ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        role="dialog"
        aria-modal="true"
        aria-label="Send a message"
      >
        <div className="cn-modal">
          <button className="cn-modal-close" onClick={closeModal} aria-label="Close modal">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <h2>Send a message</h2>

          {submitted ? (
            <p className="cn-success-msg">Message sent. We will get back to you soon.</p>
          ) : (
            <form className="cn-form" onSubmit={handleSubmit} noValidate>
              <div className="cn-form-group">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your name" required disabled={submitting} />
              </div>
              <div className="cn-form-group">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required disabled={submitting} />
              </div>
              <div className="cn-form-group">
                <label htmlFor="contact-topic">Topic</label>
                <select id="contact-topic" name="topic" value={form.topic} onChange={handleChange} required disabled={submitting}>
                  <option value="" disabled>Select a topic</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="general">General question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="cn-form-group">
                <label htmlFor="contact-query">Message</label>
                <textarea id="contact-query" name="query" value={form.query} onChange={handleChange} placeholder="Tell us what's on your mind…" required disabled={submitting} />
              </div>
              {submitError && <p className="cn-error-msg" role="alert">{submitError}</p>}
              <button type="submit" className="cn-submit-btn" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}