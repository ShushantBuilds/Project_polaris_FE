import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getRecommendations } from '../api/recommendations'
import { searchContentItems, toggleInteraction, voteOnItem } from '../api/contentItems'
import { logInteraction } from '../api/interactions'
import ContentCard from '../components/ContentCard'
import Navbar from '../components/Navbar'

export default function Feed() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
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
  // search results aren't scored, so render them fully sharp (score 1) rather than blurred —
  // blur means "low confidence recommendation," which doesn't apply to something the user explicitly searched for
  const items = isSearching
    ? (searchResults || []).map((item) => ({ ...item, confidence_score: 1 }))
    : (recommendations || [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2 max-w-md">
          <input
            type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search content…"
            className="flex-1 border border-slate/30 rounded-full px-4 py-2 bg-white text-sm focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus"
          />
          <button type="submit" className="bg-ink text-paper rounded-full px-5 text-sm font-medium hover:bg-focus transition">
            Search
          </button>
          {isSearching && (
            <button type="button" onClick={clearSearch} className="text-sm text-slate hover:text-ink transition px-2">
              Clear
            </button>
          )}
        </form>

        {isSearching && !searchLoading && (
          <p className="text-sm text-slate mb-4 font-mono">
            {items.length} result{items.length === 1 ? '' : 's'} for "{activeQuery}"
          </p>
        )}

        {isLoading && <p className="text-slate">{isSearching ? 'Searching…' : 'Bringing your feed into focus…'}</p>}
        {isError && <p className="text-red-600">{isSearching ? 'Search failed. Try again.' : "Couldn't load your feed."}</p>}
        {!isLoading && items.length === 0 && (
          <p className="text-slate">{isSearching ? 'No matches found.' : 'Nothing to show yet — check back soon.'}</p>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ContentCard
                key={item.id} item={item} score={item.confidence_score} onInteract={handleInteract}
                onToggleLike={(id) => toggleMutation.mutate({ id, type: 'LIKE' })}
                onToggleSave={(id) => toggleMutation.mutate({ id, type: 'SAVE' })}
                onVote={(id, type) => voteMutation.mutate({ id, type })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}