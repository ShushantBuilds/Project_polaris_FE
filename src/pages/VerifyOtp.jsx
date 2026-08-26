import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { verifyOtp, resendOtp } from '../api/auth'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyOtp(email, code)
      navigate('/login', { state: { justVerified: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    try {
      await resendOtp(email)
      setMessage('A new code has been sent.')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend code.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl mb-1">Check your email</h1>
        <p className="text-slate mb-8">Enter the 6-digit code we sent to {email || 'your email'}.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" maxLength={6} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required placeholder="000000"
            className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-focus">{message}</p>}
          <button type="submit" disabled={submitting || code.length !== 6}
            className="w-full bg-focus text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50 transition">
            {submitting ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <button onClick={handleResend} className="w-full text-slate text-sm mt-4 hover:text-ink transition">
          Didn't get a code? Resend
        </button>

        <p className="text-sm text-slate mt-6">
          <Link to="/login" className="text-focus hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}