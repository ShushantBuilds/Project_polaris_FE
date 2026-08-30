import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ContentCard({ item, score, onInteract, onToggleLike, onToggleSave, onVote }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  
  // New State for the Modal
  const [isModalOpen, setIsModalOpen] = useState(false) 

  const blurPx = hovered ? 0 : (1 - score) * 4
  const cardOpacity = hovered ? 1 : 0.5 + score * 0.5

  const requireAuth = (action) => (e) => {
    e.stopPropagation() // Prevent clicks from bleeding through to the modal
    if (!user) { navigate('/login'); return }
    action()
  }

  // Opens the modal instead of instantly redirecting
  const openModal = (e) => {
    e.stopPropagation()
    setIsModalOpen(true)
    // We register a 'CLICK' interaction when they decide to read more
    if (user) onInteract?.(item.id, 'CLICK') 
  }

  const closeModal = (e) => {
    e.stopPropagation()
    setIsModalOpen(false)
  }

  // The actual outbound link handler
  const handleOutboundClick = (e) => {
    e.stopPropagation()
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  // Extracted buttons into a reusable block so we can render them in both the card and the modal
  const ActionButtons = () => (
    <div className="flex items-center gap-4 text-xs font-mono">
      <button onClick={requireAuth(() => onToggleLike(item.id))} className={`flex items-center gap-1 transition ${item.is_liked ? 'text-focus' : 'text-slate hover:text-ink'}`}>
        {item.is_liked ? '♥' : '♡'} Like
      </button>
      <button onClick={requireAuth(() => onToggleSave(item.id))} className={`flex items-center gap-1 transition ${item.is_saved ? 'text-focus' : 'text-slate hover:text-ink'}`}>
        {item.is_saved ? '★' : '☆'} Save
      </button>
      <div className="flex items-center gap-1 ml-auto">
        <button onClick={requireAuth(() => onVote(item.id, 'UPVOTE'))} className={`transition ${item.user_vote === 'UPVOTE' ? 'text-focus' : 'text-slate hover:text-ink'}`}>▲</button>
        <span className="text-slate">{item.upvotes - item.downvotes}</span>
        <button onClick={requireAuth(() => onVote(item.id, 'DOWNVOTE'))} className={`transition ${item.user_vote === 'DOWNVOTE' ? 'text-red-500' : 'text-slate hover:text-ink'}`}>▼</button>
      </div>
    </div>
  )

  return (
    <>
      {/* 1. The Main Grid Card */}
      <div
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} 
        onClick={openModal} 
        style={{ filter: `blur(${blurPx}px)`, opacity: cardOpacity }}
        className="group cursor-pointer flex flex-col h-full border border-slate/15 rounded-lg p-5 bg-white transition-all duration-500 hover:border-focus/40 hover:shadow-sm"
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.map((tag, index) => (
            <span key={tag.id || `tag-${index}`} className="font-mono text-[11px] uppercase tracking-wide text-slate bg-halo px-2 py-0.5 rounded-full">
              {tag.name || tag}
            </span>
          ))}
        </div>
        <h3 className="font-display text-xl text-ink mb-1.5 leading-snug">{item.title}</h3>
        
        {/* flex-1 pushes the action buttons to the absolute bottom, keeping cards uniform */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-slate leading-relaxed line-clamp-6">
            {item.ai_summary || item.description}
          </p>
          {(item.ai_summary || item.description?.length > 250) && (
            <span className="text-focus text-sm font-medium hover:underline mt-1 inline-block">Read more...</span>
          )}
        </div>

        {/* Stop Propagation prevents opening the modal when you just want to click 'Like' */}
        <div onClick={(e) => e.stopPropagation()}>
           <ActionButtons />
        </div>
      </div>

      {/* 2. The Glassmorphic Reading Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-md p-4 animate-fade-in"
          onClick={closeModal}
        >
          {/* Prevent clicks inside the modal from closing it */}
          <div 
            className="bg-paper w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate hover:text-ink transition-colors p-2 bg-white/50 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Scrollable Content Area */}
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map((tag, index) => (
                  <span key={tag.id || `tag-${index}`} className="font-mono text-[11px] uppercase tracking-wide text-slate bg-halo px-2 py-0.5 rounded-full">
                    {tag.name || tag}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-3xl text-ink mb-6 leading-tight pr-8">{item.title}</h2>
              {item.ai_summary && (
                <p className="text-sm text-focus font-mono mb-4 border-l-2 border-focus/30 pl-3 py-1">{item.ai_summary}</p>
              )}
              <p className="text-base text-slate leading-relaxed mb-8 whitespace-pre-wrap">{item.description}</p>   
            </div>

            {/* Fixed Footer Area */}
            <div className="p-6 bg-white border-t border-slate/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <ActionButtons />
              </div>
              <button 
                onClick={handleOutboundClick}
                className="w-full sm:w-auto bg-ink text-paper px-6 py-2.5 rounded-full text-sm font-medium hover:bg-focus transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Visit original source
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}