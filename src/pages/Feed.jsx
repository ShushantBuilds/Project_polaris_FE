import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getRecommendations } from '../api/recommendations'
import { searchContentItems, toggleInteraction, voteOnItem } from '../api/contentItems'
import { logInteraction } from '../api/interactions'
import ContentCard from '../components/ContentCard'
import ReadingModal from '../components/ReadingModal'
import Navbar from '../components/Navbar'

export default function Feed() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [readingItem, setReadingItem] = useState(null)
  const isSearching = activeQuery.trim().length > 0

  const { data: recommendations, isLoading: recLoading, isError: recError } = useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    enabled: !isSearching,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, type }) => toggleInteraction(id, type),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recommendations'] }); queryClient.invalidateQueries({ queryKey: ['search'] }) },
  })

  const voteMutation = useMutation({
    mutationFn: ({ id, type }) => voteOnItem(id, type),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recommendations'] }); queryClient.invalidateQueries({ queryKey: ['search'] }) },
  })

  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useQuery({
    queryKey: ['search', activeQuery],
    queryFn: () => searchContentItems(activeQuery),
    enabled: isSearching,
  })

  const handleInteract = async (contentItemId, interactionType) => {
    try {
      await logInteraction(contentItemId, interactionType)
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    } catch {
      // a failed log shouldn't block browsing
    }
  }

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

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setActiveQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setActiveQuery('')
  }

  const isLoading = isSearching ? searchLoading : recLoading
  const isError = isSearching ? searchError : recError
  const items = isSearching
    ? (searchResults || []).map((item) => ({ ...item, confidence_score: 1 }))
    : (recommendations || [])

  return (
    <div className="min-h-screen bg-paper flex flex-col relative text-ink font-body">
      
      {/* Ambient Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
         <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-focus rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      </div>

      <div className="z-20 relative">
        <Navbar />
      </div>

      <main className="z-10 relative flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <form onSubmit={handleSearchSubmit} className="mb-12 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1 group shadow-sm rounded-full">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
               <svg className="w-5 h-5 text-slate group-focus-within:text-focus transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
            <input
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search across all fields..."
              className="w-full border border-slate/20 rounded-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm text-base focus:outline-none focus:border-focus focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-ink text-paper rounded-full px-8 py-3 font-medium hover:bg-focus hover:-translate-y-0.5 transition-all shadow-sm">
              Search
            </button>
            {isSearching && (
              <button type="button" onClick={clearSearch} className="text-slate hover:text-ink px-4 transition-colors font-medium text-sm">
                Clear
              </button>
            )}
          </div>
        </form>

        {isSearching && !searchLoading && (
          <p className="text-sm text-slate mb-6 font-mono uppercase tracking-widest border-b border-slate/15 pb-2">
            {items.length} result{items.length === 1 ? '' : 's'} for "{activeQuery}"
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 mt-10">
            <div className="w-5 h-5 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate font-mono text-sm uppercase tracking-widest">{isSearching ? 'Searching…' : 'Bringing your feed into focus…'}</p>
          </div>
        )}
        
        {isError && <p className="text-red-600 font-medium">{isSearching ? 'Search failed. Try again.' : "Couldn't load your feed."}</p>}
        
        {!isLoading && items.length === 0 && (
          <div className="py-10">
            <p className="text-slate text-lg">{isSearching ? 'No matches found.' : 'Nothing to show yet — check back soon.'}</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ContentCard
                key={item.id} item={item} score={item.confidence_score} onInteract={handleInteract}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onVote={handleVote}
                onOpen={setReadingItem}
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