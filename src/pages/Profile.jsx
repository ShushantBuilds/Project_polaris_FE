import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTags } from '../api/tags'
import { getMyProfile, updateProfile } from '../api/profile'
import { updateMe, uploadProfilePicture, requestEmailChange, confirmEmailChange } from '../api/user'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORY_LABELS = { GENRE: 'Topics', FORMAT: 'Formats', DIFFICULTY: 'Difficulty' }

export default function Profile() {
  const { user, setUser } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({ first_name: '', last_name: '', phone_number: '' })
  const [saved, setSaved] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [newEmail, setNewEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailChangeError, setEmailChangeError] = useState('')
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name, last_name: user.last_name, phone_number: user.phone_number })
  }, [user])

  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: profile } = useQuery({ queryKey: ['myProfile'], queryFn: getMyProfile })

  useEffect(() => {
    if (profile) setSelected(new Set(profile.explicit_preferences))
  }, [profile])

  const infoMutation = useMutation({
    mutationFn: () => updateMe(form),
    onSuccess: (data) => {
      setUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const prefsMutation = useMutation({
    mutationFn: () => updateProfile(profile.id, { explicit_preferences: Array.from(selected) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProfile'] }),
  })

  const toggleTag = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const grouped = (tags || []).reduce((acc, tag) => {
    acc[tag.category] = acc[tag.category] || []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const avatarMutation = useMutation({
    mutationFn: () => uploadProfilePicture(avatarFile),
    onSuccess: (data) => { setUser(data); setAvatarFile(null); setAvatarPreview(null) },
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) }
  }

  const handleSendEmailOtp = async () => {
    setEmailChangeError(''); setSendingEmailOtp(true)
    try {
      await requestEmailChange(newEmail)
      setEmailOtpSent(true)
    } catch (err) {
      setEmailChangeError(err.response?.data?.error || 'Could not send code.')
    } finally { setSendingEmailOtp(false) }
  }

  const handleConfirmEmailChange = async () => {
    setEmailChangeError(''); setConfirmingEmail(true)
    try {
      const updated = await confirmEmailChange(newEmail, emailOtp)
      setUser(updated)
      setNewEmail(''); setEmailOtp(''); setEmailOtpSent(false)
    } catch (err) {
      setEmailChangeError(err.response?.data?.error || 'Invalid code.')
    } finally { setConfirmingEmail(false) }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body">
      
      {/* Ambient Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
         <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-focus rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
         <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>

      <div className="z-20 relative">
        <Navbar />
      </div>

      <main className="z-10 relative max-w-3xl mx-auto px-6 py-12 w-full space-y-8">
        
        {/* Account Details Block */}
        <section className="bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group w-24 h-24">
                <label htmlFor="avatar-upload" className="cursor-pointer block relative w-full h-full rounded-full overflow-hidden border-2 border-slate/10 shadow-sm">
                    {avatarPreview || user?.profile_picture ? (
                        <img src={avatarPreview || user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="w-full h-full bg-halo text-focus font-mono flex items-center justify-center text-3xl">
                            {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || '?'}
                        </span>
                    )}
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </label>
                <input 
                    id="avatar-upload" type="file" accept="image/*" 
                    onChange={handleAvatarChange} className="hidden" 
                />
            </div>
            
            <div className="flex-1">
              <h1 className="font-display text-4xl mb-1 tracking-tight">Your account</h1>
              <p className="text-slate font-mono text-xs uppercase tracking-widest">
                {user?.email} <span className="mx-2">•</span> Joined {user && new Date(user.date_joined).toLocaleDateString()}
              </p>
            </div>
            
            {avatarFile && (
                <div>
                    <button 
                        type="button" onClick={() => avatarMutation.mutate()} disabled={avatarMutation.isPending}
                        className="bg-focus text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50">
                        {avatarMutation.isPending ? 'Uploading…' : 'Save Photo'}
                    </button>
                </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); infoMutation.mutate() }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2">First name</label>
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2">Last name</label>
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-slate mb-2">Phone number</label>
              <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
            </div>
            {infoMutation.isError && <p className="text-sm text-red-500 font-medium">Couldn't save — check your phone number is exactly 10 digits.</p>}
            <button type="submit" disabled={infoMutation.isPending}
              className="bg-ink text-paper rounded-full px-8 py-3.5 text-sm font-medium hover:bg-focus hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:bg-slate">
              {infoMutation.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Change Email Block */}
        <section className="bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
            <h2 className="font-display text-3xl mb-2 tracking-tight">Change email</h2>
            <p className="text-slate mb-6 text-sm leading-relaxed">
              Updating your email requires verification. A code will be sent to your new address.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={emailOtpSent}
                placeholder="New email address"
                className="flex-1 border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus disabled:opacity-70 transition-all" />
                <button type="button" onClick={handleSendEmailOtp} disabled={sendingEmailOtp || emailOtpSent || !newEmail}
                    className="shrink-0 bg-ink text-paper rounded-xl px-6 py-3 font-medium hover:bg-focus transition-all disabled:opacity-50">
                    {sendingEmailOtp ? 'Sending…' : 'Get OTP'}
                </button>
            </div>

            {emailOtpSent && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3 animate-fade-in">
                    <input type="text" inputMode="numeric" maxLength={6} value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="flex-1 border border-slate/20 rounded-xl px-4 py-3 bg-white/60 backdrop-blur-sm text-center font-mono tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all" />
                    <button type="button" onClick={handleConfirmEmailChange} disabled={confirmingEmail || emailOtp.length !== 6}
                        className="shrink-0 bg-focus text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-all disabled:opacity-50">
                        {confirmingEmail ? 'Confirming…' : 'Confirm'}
                    </button>
                </div>
            )}
            {emailChangeError && <p className="text-sm text-red-500 font-medium mt-3">{emailChangeError}</p>}
        </section>

        {/* Interests Block */}
        <section className="bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
          <h2 className="font-display text-3xl mb-2 tracking-tight">Your interests</h2>
          <p className="text-slate mb-8 text-sm leading-relaxed">Update what you're into — your feed adjusts right away.</p>

          <div className="space-y-8">
            {Object.entries(grouped).map(([category, categoryTags]) => (
              <div key={category}>
                <h3 className="text-xs uppercase tracking-widest text-slate font-mono mb-4 border-b border-slate/10 pb-2">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {categoryTags.map((tag) => {
                    const isSelected = selected.has(tag.id)
                    return (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all duration-300 border ${
                          isSelected 
                            ? 'bg-ink border-ink text-white shadow-sm -translate-y-0.5' 
                            : 'bg-white/60 backdrop-blur-sm border-slate/20 text-slate hover:border-focus hover:text-focus'
                        }`}>
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => prefsMutation.mutate()} disabled={prefsMutation.isPending || !profile}
            className="bg-ink text-paper rounded-full px-8 py-3.5 text-sm font-medium hover:bg-focus hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 mt-10">
            {prefsMutation.isPending ? 'Updating…' : 'Update preferences'}
          </button>
        </section>
        
      </main>
    </div>
  )
}