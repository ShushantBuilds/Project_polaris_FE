import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // Added visibility state
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
              {/* Relative wrapper added for the icon positioning */}
              <div className="relative">
                <input
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-slate/20 rounded-xl pl-4 pr-12 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
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