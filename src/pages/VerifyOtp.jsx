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
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body transition-colors duration-700">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-focus rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
      </div>

      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-xl tracking-tight font-medium">Polaris</span>
        </Link>
      </nav>

      <div className="z-10 flex-1 flex items-center justify-center px-6 mt-[-80px]">
        <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 shadow-sm">
          
          <h1 className="font-display text-4xl mb-2 tracking-tight">Check your email</h1>
          <p className="text-slate mb-8 font-body text-sm leading-relaxed">
            Enter the 6-digit code we sent to <span className="font-medium text-ink">{email || 'your email'}</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required placeholder="000000"
                className="w-full border border-slate/20 rounded-xl px-4 py-4 bg-white/60 backdrop-blur-sm text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all"
              />
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            {message && <p className="text-sm text-focus font-medium text-center">{message}</p>}
            
            <button type="submit" disabled={submitting || code.length !== 6}
              className="w-full bg-ink text-paper rounded-full py-4 font-body font-medium hover:bg-focus hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink">
              {submitting ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <button onClick={handleResend} className="w-full text-center text-xs text-slate mt-6 hover:text-ink transition">
            Didn't get a code? Resend
          </button>

          <p className="text-sm text-slate mt-8 text-center">
            <Link to="/login" className="text-ink font-medium hover:text-focus transition-colors">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}