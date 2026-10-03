import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/feed')
    } catch (err) {
        const detail = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0]
        setError(detail || 'Incorrect email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body transition-colors duration-700">
      
      {/* Unified Dual Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-focus rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      </div>

      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-xl tracking-tight font-medium">Polaris</span>
        </Link>
      </nav>

      <div className="z-10 flex-1 flex items-center justify-center px-6 mt-[-80px]">
        <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
          
          <h1 className="font-display text-4xl mb-2 tracking-tight">Welcome back</h1>
          <p className="text-slate mb-8 font-body text-sm leading-relaxed">
            Sign in to pick up your feed.
          </p>
          
          {location.state?.justReset && (
              <p className="text-sm text-focus mb-4 font-medium">Password reset successfully — sign in with your new password.</p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="email">Email</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all"
              />
            </div>
            
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="password">Password</label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all"
              />
            </div>
            
            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-xs text-slate hover:text-ink transition-colors">Forgot password?</Link>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button
              type="submit" disabled={submitting}
              className="w-full bg-ink text-paper rounded-full py-4 font-body font-medium hover:bg-focus hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink mt-2"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-slate mt-8 text-center">
            New here? <Link to="/register" className="text-ink font-medium hover:text-focus transition-colors">Create an account</Link>
          </p>
          
        </div>
      </div>
    </div>
  )
}