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
  const { user, setUser } = useAuth()

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
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    // 1. Locked viewport height (h-screen) prevents the whole page from endlessly scrolling
    <div className="h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body transition-colors duration-700">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      </div>

      <div className="z-10 flex-1 flex items-center justify-center px-6 py-10">
        
        {/* 2. Added flex-col and max-h-[90vh] so the card limits its own height */}
        <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col max-h-[90vh]">
          
          <div className="text-center mb-8 shrink-0">
            <h1 className="font-display text-4xl md:text-5xl mb-3 tracking-tight">Coming into focus</h1>
            <p className="text-slate font-body text-base leading-relaxed">
              Pick a few things you're into — your feed sharpens from here.
            </p>
          </div>

          {/* 3. The tags list now handles its own internal scrolling (overflow-y-auto) */}
          <div className="space-y-8 overflow-y-auto pr-4 -mr-4 flex-1">
            {Object.entries(grouped).map(([category, categoryTags]) => (
              <div key={category}>
                <h2 className="text-xs uppercase tracking-widest text-slate font-mono mb-4 border-b border-slate/10 pb-2 text-left">
                  {CATEGORY_LABELS[category] || category}
                </h2>
                {/* 4. Enforced justify-start ensures tags left-align cleanly like a paragraph */}
                <div className="flex flex-wrap gap-2.5 justify-start">
                  {categoryTags.map((tag) => {
                    const isSelected = selected.has(tag.id)
                    return (
                      <button
                        key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 rounded-full text-xs font-mono tracking-wide transition-all duration-300 border ${
                          isSelected 
                            ? 'bg-ink border-ink text-white shadow-md -translate-y-0.5' 
                            : 'bg-white/60 backdrop-blur-sm border-slate/20 text-slate hover:border-focus hover:text-focus'
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

          {mutation.isError && <p className="text-sm text-red-500 font-medium mt-4 shrink-0 text-center">Something went wrong — try again.</p>}

          {/* 5. Footer actions stay pinned to the bottom of the card while you scroll tags */}
          <div className="mt-8 shrink-0 flex flex-col items-center gap-4 pt-6 border-t border-slate/10">
            <button
              type="button" disabled={selected.size === 0 || mutation.isPending || !profile}
              onClick={() => mutation.mutate()}
              className="w-full max-w-sm bg-focus text-white rounded-full py-4 font-body font-medium hover:bg-ink hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:bg-slate"
            >
              {mutation.isPending ? 'Sharpening…' : 'Sharpen my feed'}
            </button>

            <button type="button" onClick={() => navigate('/feed')} className="text-slate text-sm hover:text-ink transition-colors">
              Skip for now
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}