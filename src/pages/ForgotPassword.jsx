import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestPasswordReset, confirmPasswordReset } from '../api/auth'

export default function ForgotPassword() {
  const [stage, setStage] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    setSubmitting(true)
    try {
      const { data } = await requestPasswordReset(email)
      setMessage(data.message)
      setStage('reset')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmNewPassword) {
      setError("Passwords don't match.")
      return
    }
    setSubmitting(true)
    try {
      await confirmPasswordReset(email, otpCode, newPassword, confirmNewPassword)
      navigate('/login', { state: { justReset: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {stage === 'request' ? (
          <>
            <h1 className="text-3xl mb-1">Reset your password</h1>
            <p className="text-slate mb-8">Enter your email and we'll send you a code.</p>
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-sm text-slate mb-1" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full bg-focus text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50 transition">
                {submitting ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl mb-1">Check your email</h1>
            <p className="text-slate mb-8">{message}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-slate mb-1" htmlFor="otp">Code</label>
                <input id="otp" type="text" inputMode="numeric" maxLength={6} value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white text-center font-mono tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
              <div>
                <label className="block text-sm text-slate mb-1" htmlFor="newPassword">New password</label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
              <div>
                <label className="block text-sm text-slate mb-1" htmlFor="confirmNewPassword">Confirm new password</label>
                <input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full bg-focus text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50 transition">
                {submitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
            <button type="button" onClick={() => setStage('request')} className="text-sm text-slate mt-4 hover:text-ink transition">
              Wrong email? Start over
            </button>
          </>
        )}

        <p className="text-sm text-slate mt-6">
          <Link to="/login" className="text-focus hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}