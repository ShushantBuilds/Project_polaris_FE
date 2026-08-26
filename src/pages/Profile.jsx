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
    <div className="min-h-screen">
      <Navbar/>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        <section>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative group w-20 h-20">
                  <label htmlFor="avatar-upload" className="cursor-pointer block relative w-full h-full rounded-full overflow-hidden border border-slate/20">
                      {avatarPreview || user?.profile_picture ? (
                          <img src={avatarPreview || user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <span className="w-full h-full bg-halo text-focus font-mono flex items-center justify-center text-xl">
                              {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || '?'}
                          </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                      </div>
                  </label>
                  <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                  />
              </div>
              {avatarFile && (
                  <div>
                      <button 
                          type="button" 
                          onClick={() => avatarMutation.mutate()} 
                          disabled={avatarMutation.isPending}
                          className="bg-focus text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
                          {avatarMutation.isPending ? 'Uploading…' : 'Save Photo'}
                      </button>
                  </div>
              )}
          </div>
          <h1 className="font-display text-3xl mb-1">Your account</h1>
          <p className="text-slate mb-6 text-sm">
            {user?.email} · joined {user && new Date(user.date_joined).toLocaleDateString()}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); infoMutation.mutate() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate mb-1">First name</label>
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
              <div>
                <label className="block text-sm text-slate mb-1">Last name</label>
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate mb-1">Phone number</label>
              <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
            </div>
            {infoMutation.isError && <p className="text-sm text-red-600">Couldn't save — check your phone number is exactly 10 digits.</p>}
            <button type="submit" disabled={infoMutation.isPending}
              className="bg-focus text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
              {infoMutation.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </form>
        </section>

        <section>
            <h2 className="font-display text-2xl mb-1">Change email</h2>
            <p className="text-slate mb-4 text-sm">Current: {user?.email}</p>

            <div className="flex gap-2">
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={emailOtpSent}
                placeholder="New email address"
                className="flex-1 border border-slate/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus disabled:opacity-70" />
                <button type="button" onClick={handleSendEmailOtp} disabled={sendingEmailOtp || emailOtpSent || !newEmail}
                    className="shrink-0 bg-ink text-paper rounded-md px-4 text-sm font-medium hover:bg-focus transition disabled:opacity-50">
                    {sendingEmailOtp ? '…' : 'Get OTP'}
                </button>
            </div>

            {emailOtpSent && (
                <div className="mt-3 flex gap-2">
                    <input type="text" inputMode="numeric" maxLength={6} value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="flex-1 border border-slate/30 rounded-md px-3 py-2 bg-white text-center font-mono tracking-widest focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus" />
                    <button type="button" onClick={handleConfirmEmailChange} disabled={confirmingEmail || emailOtp.length !== 6}
                        className="shrink-0 bg-focus text-white rounded-md px-4 text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                        {confirmingEmail ? 'Confirming…' : 'Confirm'}
                    </button>
                </div>
            )}
            {emailChangeError && <p className="text-sm text-red-600 mt-2">{emailChangeError}</p>}
        </section>

        <section>
          <h2 className="font-display text-2xl mb-1">Your interests</h2>
          <p className="text-slate mb-4 text-sm">Update what you're into — your feed adjusts right away.</p>

          <div className="space-y-5">
            {Object.entries(grouped).map(([category, categoryTags]) => (
              <div key={category}>
                <h3 className="text-xs uppercase tracking-wide text-slate font-mono mb-2">{CATEGORY_LABELS[category] || category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => {
                    const isSelected = selected.has(tag.id)
                    return (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-mono border transition ${
                          isSelected ? 'bg-halo border-focus text-focus' : 'border-slate/30 text-slate hover:border-slate/60'
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
            className="bg-ink text-paper rounded-md px-5 py-2 text-sm font-medium hover:bg-focus transition disabled:opacity-50 mt-6">
            {prefsMutation.isPending ? 'Updating…' : 'Update preferences'}
          </button>
        </section>
      </main>
    </div>
  )
}