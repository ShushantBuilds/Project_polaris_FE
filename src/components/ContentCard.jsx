import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ContentCard({ item, score, onInteract, onToggleLike, onToggleSave, onVote }) {
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

  const handleClick = () => {
    if (user) onInteract?.(item.id, 'CLICK')
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={handleClick}
      style={{ filter: `blur(${blurPx}px)`, opacity: cardOpacity }}
      className="group cursor-pointer border border-slate/15 rounded-lg p-5 bg-white transition-all duration-500 hover:border-focus/40 hover:shadow-sm"
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {item.tags.map((tag, index) => (
          <span 
            key={tag.id || `tag-${index}`} 
            className="font-mono text-[11px] uppercase tracking-wide text-slate bg-halo px-2 py-0.5 rounded-full"
          >
            {tag.name || tag} 
          </span>
        ))}
      </div>
      <h3 className="font-display text-xl text-ink mb-1.5 leading-snug">{item.title}</h3>
      <p className="text-sm text-slate leading-relaxed mb-4">{item.description}</p>

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
    </div>
  )
}