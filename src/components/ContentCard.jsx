import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ContentCard({ item, score, onInteract, onToggleLike, onToggleSave, onVote, onOpen }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const blurPx = hovered ? 0 : (1 - score) * 4
  const cardOpacity = hovered ? 1 : 0.5 + score * 0.5

  const requireAuth = (action) => (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    action()
  }

  const handleOpen = (e) => {
    e.stopPropagation()
    onOpen(item)
    if (user) onInteract?.(item.id, 'CLICK')
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={handleOpen}
      style={{ filter: `blur(${blurPx}px)`, opacity: cardOpacity }}
      className="group cursor-pointer flex flex-col h-full border border-slate/20 rounded-3xl p-6 md:p-8 bg-white/40 backdrop-blur-xl transition-all duration-500 hover:border-focus/40 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.map((tag, index) => (
          <span key={tag.id || `tag-${index}`} className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border bg-white/60 border-slate/20 text-slate">
            {tag.name || tag}
          </span>
        ))}
      </div>
      
      <h3 className="font-display text-2xl text-ink mb-3 leading-snug group-hover:text-focus transition-colors duration-300">{item.title}</h3>

      <div className="flex-1 mb-6">
        <p className="text-sm text-slate leading-relaxed line-clamp-5">
          {item.ai_summary || item.description}
        </p>
        {(item.ai_summary || item.description?.length > 250) && (
          <span className="text-focus text-sm font-medium hover:underline mt-2 inline-block">Read more...</span>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-4 text-xs font-mono pt-4 border-t border-slate/10">
        <button onClick={requireAuth(() => onToggleLike(item.id))} className={`flex items-center gap-1 transition-colors ${item.is_liked ? 'text-focus' : 'text-slate hover:text-ink'}`}>
          {item.is_liked ? '♥' : '♡'} Like
        </button>
        <button onClick={requireAuth(() => onToggleSave(item.id))} className={`flex items-center gap-1 transition-colors ${item.is_saved ? 'text-focus' : 'text-slate hover:text-ink'}`}>
          {item.is_saved ? '★' : '☆'} Save
        </button>
        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={requireAuth(() => onVote(item.id, 'UPVOTE'))} className={`transition-transform hover:-translate-y-0.5 ${item.user_vote === 'UPVOTE' ? 'text-focus' : 'text-slate hover:text-ink'}`}>▲</button>
          <span className="text-slate font-medium min-w-[1.5rem] text-center">{item.upvotes - item.downvotes}</span>
          <button onClick={requireAuth(() => onVote(item.id, 'DOWNVOTE'))} className={`transition-transform hover:translate-y-0.5 ${item.user_vote === 'DOWNVOTE' ? 'text-red-500' : 'text-slate hover:text-ink'}`}>▼</button>
        </div>
      </div>
    </div>
  )
}