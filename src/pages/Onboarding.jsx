import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTags } from '../api/tags'
import { getMyProfile, updateProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'

const CATEGORY_LABELS = { GENRE: 'Topics', FORMAT: 'Formats', DIFFICULTY: 'Difficulty' }

export default function Onboarding() {
  const [selected, setSelected] = useState(new Set())
  const navigate = useNavigate()

  const{user, setUser} = useAuth()

  const { data: tags, isLoading: tagsLoading } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: profile } = useQuery({ queryKey: ['myProfile'], queryFn: getMyProfile })

  const mutation = useMutation({
    mutationFn: () => updateProfile(profile.id, {
      explicit_preferences: Array.from(selected),
      onboarding_completed: true,
    }),
    onSuccess: () => {
      setUser({ ...user, onboarding_completed: true })
      navigate('/feed')
    },
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

  if (tagsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate">Loading…</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl mb-2">Coming into focus</h1>
        <p className="text-slate mb-8">Pick a few things you're into — your feed sharpens from here.</p>

        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryTags]) => (
            <div key={category}>
              <h2 className="text-xs uppercase tracking-wide text-slate font-mono mb-2">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => {
                  const isSelected = selected.has(tag.id)
                  return (
                    <button
                      key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-mono border transition ${
                        isSelected ? 'bg-halo border-focus text-focus' : 'border-slate/30 text-slate hover:border-slate/60'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {mutation.isError && <p className="text-sm text-red-600 mt-4">Something went wrong — try again.</p>}

        <button
          type="button" disabled={selected.size === 0 || mutation.isPending || !profile}
          onClick={() => mutation.mutate()}
          className="w-full bg-focus text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50 transition mt-8"
        >
          {mutation.isPending ? 'Sharpening…' : 'Sharpen my feed →'}
        </button>

        <button type="button" onClick={() => navigate('/feed')} className="w-full text-slate text-sm mt-3 hover:text-ink transition">
          Skip for now
        </button>
      </div>
    </div>
  )
}