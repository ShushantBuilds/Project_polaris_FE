import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getMyLibrary, toggleInteraction, voteOnItem } from '../api/contentItems'
import ContentCard from '../components/ContentCard'
import Navbar from '../components/Navbar'

export default function Library() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('liked')
  const { data, isLoading } = useQuery({ queryKey: ['myLibrary'], queryFn: getMyLibrary })

  const toggleMutation = useMutation({
    mutationFn: ({ id, type }) => toggleInteraction(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  })
  const voteMutation = useMutation({
    mutationFn: ({ id, type }) => voteOnItem(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  })

  const items = tab === 'liked' ? data?.liked : data?.saved

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-6">Your library</h1>
        <div className="flex gap-4 mb-6 border-b border-slate/15">
          <button onClick={() => setTab('liked')} className={`pb-2 text-sm font-medium ${tab === 'liked' ? 'text-focus border-b-2 border-focus' : 'text-slate'}`}>Liked</button>
          <button onClick={() => setTab('saved')} className={`pb-2 text-sm font-medium ${tab === 'saved' ? 'text-focus border-b-2 border-focus' : 'text-slate'}`}>Saved for later</button>
        </div>
        {isLoading && <p className="text-slate">Loading…</p>}
        {!isLoading && items?.length === 0 && <p className="text-slate">Nothing here yet.</p>}
        {items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} score={1}
                onToggleLike={(id) => toggleMutation.mutate({ id, type: 'LIKE' })}
                onToggleSave={(id) => toggleMutation.mutate({ id, type: 'SAVE' })}
                onVote={(id, type) => voteMutation.mutate({ id, type })} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}