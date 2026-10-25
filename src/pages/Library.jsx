import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getMyLibrary, toggleInteraction, voteOnItem } from '../api/contentItems'
import ContentCard from '../components/ContentCard'
import Navbar from '../components/Navbar'
import AmbientBackground from '../components/AmbientBackground'
import ReadingModal from '../components/ReadingModal'

export default function Library() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('liked')
  const [readingItem, setReadingItem] = useState(null)
  
  const { data, isLoading } = useQuery({ queryKey: ['myLibrary'], queryFn: getMyLibrary })

  const toggleMutation = useMutation({
    mutationFn: ({ id, type }) => toggleInteraction(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  })
  
  const voteMutation = useMutation({
    mutationFn: ({ id, type }) => voteOnItem(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  })

  // Optimistic UI updates for the modal
  const handleToggleLike = (id) => {
    setReadingItem((prev) => (prev && prev.id === id ? { ...prev, is_liked: !prev.is_liked } : prev))
    toggleMutation.mutate({ id, type: 'LIKE' })
  }
  
  const handleToggleSave = (id) => {
    setReadingItem((prev) => (prev && prev.id === id ? { ...prev, is_saved: !prev.is_saved } : prev))
    toggleMutation.mutate({ id, type: 'SAVE' })
  }
  
  const handleVote = (id, type) => {
    setReadingItem((prev) => {
      if (!prev || prev.id !== id) return prev
      let { upvotes, downvotes, user_vote } = prev
      if (user_vote === type) { user_vote = null; type === 'UPVOTE' ? upvotes-- : downvotes--; }
      else if (user_vote) { user_vote === 'UPVOTE' ? upvotes-- : downvotes--; type === 'UPVOTE' ? upvotes++ : downvotes++; user_vote = type; }
      else { type === 'UPVOTE' ? upvotes++ : downvotes++; user_vote = type; }
      return { ...prev, upvotes, downvotes, user_vote }
    })
    voteMutation.mutate({ id, type })
  }

  const items = tab === 'liked' ? data?.liked : data?.saved

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-x-hidden text-ink font-body">
      
      <AmbientBackground />
      
      <div className="z-20 relative">
        <Navbar />
      </div>
      
      <main className="z-10 relative flex-1 w-full px-8 md:px-12 lg:px-16 py-10">
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
          <div className="py-16 text-center bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl max-w-2xl shadow-sm">
            <span className="text-4xl block mb-4">📚</span>
            <h3 className="font-display text-2xl mb-2 text-ink">Nothing here yet</h3>
            <p className="text-slate text-sm">Papers you {tab === 'liked' ? 'like' : 'save'} will appear here for easy access.</p>
          </div>
        )}
        
        {items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item} 
                score={1}
                onOpen={setReadingItem}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onVote={handleVote} 
              />
            ))}
          </div>
        )}
      </main>

      <ReadingModal
        item={readingItem}
        onClose={() => setReadingItem(null)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onVote={handleVote}
      />
    </div>
  )
}