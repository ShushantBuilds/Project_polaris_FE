// src/pages/Register.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { useAuth } from '../context/AuthContext'
import { sendRegistrationOtp, verifyRegistrationOtp } from '../api/auth'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const recaptchaRef = useRef(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleGetOtp = async () => {
    setOtpError('')
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setOtpError('Enter a valid email first.')
      return
    }
    setSendingOtp(true)
    try {
      await sendRegistrationOtp(formData.email)
      setOtpSent(true)
      setCooldown(60)
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Could not send code.')
    } finally {
      setSendingOtp(false)
    }
  }

    const handleOtpChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtpCode(value)
    setOtpError('')
    if (value.length === 6) {
      setVerifyingOtp(true)
      try {
        await verifyRegistrationOtp(formData.email, value)
        setEmailVerified(true)
      } catch (err) {
        setOtpError(err.response?.data?.error || 'Invalid code.')
      } finally {
        setVerifyingOtp(false)
      }
    }
  }

  const handleEditEmail = () => {
    setOtpSent(false)
    setEmailVerified(false)
    setOtpCode('')
    setOtpError('')
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (!emailVerified) {
    setError('Please verify your email first.')
    return
  }
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords don't match.")
    return
  }
  const recaptchaToken = recaptchaRef.current?.getValue()
  if (!recaptchaToken) {
    setError('Please complete the captcha.')
    return
  }

  setSubmitting(true)
  try {
    await register({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phoneNumber,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      recaptcha_token: recaptchaToken,
    })
  } catch (err) {
    const data = err.response?.data || {}
    const firstError = Object.values(data)[0]
    setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Something went wrong.')
    recaptchaRef.current?.reset()
  } finally {
    setSubmitting(false)
  }
}

useEffect(() => {
  if (cooldown <= 0) return
  const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
  return () => clearTimeout(timer)
}, [cooldown])


  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body transition-colors duration-700">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>

      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-xl tracking-tight font-medium">Polaris</span>
        </Link>
      </nav>

      <div className="z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 shadow-sm">
          
          <h1 className="font-display text-4xl mb-2 tracking-tight">Create your account</h1>
          <p className="text-slate mb-8 font-body text-sm leading-relaxed">
            A few things you like, and we'll take it from there.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required
                  className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required
                  className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="email">Email</label>
              <div className="flex gap-2">
                <input
                  id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                  required disabled={otpSent}
                  className="flex-1 border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all disabled:opacity-70"
                />
                {!emailVerified ? (
                  <button
                    type="button" onClick={handleGetOtp} disabled={sendingOtp || cooldown > 0 || !formData.email}
                    className="shrink-0 bg-ink text-paper rounded-xl px-5 font-mono text-xs uppercase tracking-wide hover:bg-focus transition disabled:opacity-50"
                  >
                    {sendingOtp ? '…' : cooldown > 0 ? `${cooldown}s` : otpSent ? 'Resend' : 'Get OTP'}
                  </button>
                ) : (
                  <span className="shrink-0 flex items-center gap-1 text-focus text-xs font-mono px-3">✓ Verified</span>
                )}
              </div>

              {otpSent && !emailVerified && (
                <div className="mt-3">
                  <input
                    type="text" inputMode="numeric" maxLength={6} value={otpCode} onChange={handleOtpChange}
                    placeholder="Enter 6-digit code" disabled={verifyingOtp}
                    className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm text-center font-mono tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                    <button type="button" onClick={handleEditEmail} className="text-xs text-slate hover:text-ink ml-auto">
                      Wrong email? Edit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="phoneNumber">Phone number</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required
                className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
            </div>

            {/* Primary Password Field with Toggle */}
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" name="password" 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password} onChange={handleChange} required minLength={8}
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
              <p className="font-mono text-[10px] text-slate mt-2 tracking-wide uppercase">At least 8 characters.</p>
            </div>

            {/* Confirm Password Field with Toggle */}
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2" htmlFor="confirmPassword">Confirm password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={formData.confirmPassword} onChange={handleChange} required
                  className="w-full border border-slate/20 rounded-xl pl-4 pr-12 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button type="submit" disabled={submitting || !emailVerified}
              className="w-full bg-ink text-paper rounded-full py-4 font-body font-medium hover:bg-focus hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-ink">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-slate mt-8 text-center">
            Already have an account? <Link to="/login" className="text-ink font-medium hover:text-focus transition-colors">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  )
}