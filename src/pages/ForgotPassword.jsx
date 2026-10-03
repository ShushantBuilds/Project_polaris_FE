import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestPasswordReset, confirmPasswordReset } from '../api/auth'

export default function ForgotPassword() {
  const [stage, setStage] = useState('request') 
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
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body transition-colors duration-700">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-halo rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>

      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-xl tracking-tight font-medium">Polaris</span>
        </Link>
      </nav>

      <div className="z-10 flex-1 flex items-center justify-center px-6 mt-[-80px]">
        <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 shadow-sm">
          
          {stage === 'request' ? (
            <>
              <h1 className="font-display text-4xl mb-2 tracking-tight">Reset password</h1>
              <p className="text-slate mb-8 font-body text-sm leading-relaxed">Enter your email and we'll send you a code.</p>
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="email">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
                </div>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full bg-ink text-paper rounded-full py-4 font-body font-medium hover:bg-focus hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink">
                  {submitting ? 'Sending…' : 'Send reset code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl mb-2 tracking-tight">Check your email</h1>
              <p className="text-slate mb-8 font-body text-sm leading-relaxed">{message}</p>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="otp">6-Digit Code</label>
                  <input id="otp" type="text" inputMode="numeric" maxLength={6} value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                    className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm text-center font-mono tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="newPassword">New password</label>
                  <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                    className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="confirmNewPassword">Confirm new password</label>
                  <input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required
                    className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
                </div>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full bg-ink text-paper rounded-full py-4 font-body font-medium hover:bg-focus hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink">
                  {submitting ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
              <button type="button" onClick={() => setStage('request')} className="w-full text-center text-xs text-slate mt-6 hover:text-ink transition">
                Wrong email? Start over
              </button>
            </>
          )}

          <p className="text-sm text-slate mt-8 text-center">
            <Link to="/login" className="text-ink font-medium hover:text-focus transition-colors">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}