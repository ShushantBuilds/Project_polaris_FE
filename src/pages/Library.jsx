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
    <div className="min-h-screen bg-paper flex flex-col relative text-ink font-body">
      
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
         <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
      </div>
      
      <div className="z-20 relative">
        <Navbar />
      </div>
      
      <main className="z-10 relative flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <h1 className="font-display text-4xl mb-8 tracking-tight">Your library</h1>
        
        <div className="flex gap-8 mb-10 border-b border-slate/15">
          <button 
            onClick={() => setTab('liked')} 
            className={`pb-3 text-sm font-mono uppercase tracking-widest transition-all ${tab === 'liked' ? 'text-focus border-b-2 border-focus' : 'text-slate hover:text-ink'}`}
          >
            Liked
          </button>
          <button 
            onClick={() => setTab('saved')} 
            className={`pb-3 text-sm font-mono uppercase tracking-widest transition-all ${tab === 'saved' ? 'text-focus border-b-2 border-focus' : 'text-slate hover:text-ink'}`}
          >
            Saved for later
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate font-mono text-sm uppercase tracking-widest">Loading library…</p>
          </div>
        )}
        
        {!isLoading && items?.length === 0 && (
          <div className="py-10">
            <span className="text-4xl block mb-4">📚</span>
            <p className="text-slate text-lg">Nothing here yet.</p>
          </div>
        )}
        
        {items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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