import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ReadingModal({ item, onClose, onToggleLike, onToggleSave, onVote }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!item) return null

  const requireAuth = (action) => (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    action()
  }

  const handleOutboundClick = (e) => {
    e.stopPropagation()
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-lg p-4 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-paper/90 backdrop-blur-2xl w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate hover:text-ink transition-all duration-300 p-2.5 bg-white/60 hover:bg-white backdrop-blur-md rounded-full shadow-sm hover:shadow z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex flex-wrap gap-2 mb-6">
            {item.tags.map((tag, index) => (
              <span key={tag.id || `tag-${index}`} className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase border bg-white/60 border-slate/20 text-slate shadow-sm">
                {tag.name || tag}
              </span>
            ))}
          </div>
          
          <h2 className="font-display text-4xl text-ink mb-8 leading-tight pr-12">{item.title}</h2>
          
          {item.ai_summary && (
            <div className="mb-8 bg-focus/5 border-l-4 border-focus rounded-r-xl p-5">
               <p className="text-xs uppercase font-mono tracking-widest text-focus mb-2">AI Summary</p>
               <p className="text-sm text-ink/80 leading-relaxed">{item.ai_summary}</p>
            </div>
          )}
          
          <p className="text-base md:text-lg text-slate leading-relaxed mb-8 whitespace-pre-wrap">{item.description}</p>
        </div>

        {/* Frosted Glass Footer */}
        <div className="p-6 md:px-12 md:py-6 bg-white/50 backdrop-blur-md border-t border-slate/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-xs font-mono w-full sm:w-auto">
            <button onClick={requireAuth(() => onToggleLike(item.id))} className={`flex items-center gap-1.5 transition-colors ${item.is_liked ? 'text-focus' : 'text-slate hover:text-ink'}`}>
              <span className="text-base">{item.is_liked ? '♥' : '♡'}</span> Like
            </button>
            <button onClick={requireAuth(() => onToggleSave(item.id))} className={`flex items-center gap-1.5 transition-colors ${item.is_saved ? 'text-focus' : 'text-slate hover:text-ink'}`}>
              <span className="text-base">{item.is_saved ? '★' : '☆'}</span> Save
            </button>
            <div className="flex items-center gap-2 ml-auto sm:ml-4 bg-white/60 px-4 py-2 rounded-full border border-slate/15">
              <button onClick={requireAuth(() => onVote(item.id, 'UPVOTE'))} className={`transition-transform hover:-translate-y-0.5 ${item.user_vote === 'UPVOTE' ? 'text-focus' : 'text-slate hover:text-ink'}`}>▲</button>
              <span className="text-slate font-medium min-w-[1.5rem] text-center">{item.upvotes - item.downvotes}</span>
              <button onClick={requireAuth(() => onVote(item.id, 'DOWNVOTE'))} className={`transition-transform hover:translate-y-0.5 ${item.user_vote === 'DOWNVOTE' ? 'text-red-500' : 'text-slate hover:text-ink'}`}>▼</button>
            </div>
          </div>
          
          <button
            onClick={handleOutboundClick}
            className="w-full sm:w-auto bg-ink text-paper px-8 py-3.5 rounded-full text-sm font-medium hover:bg-focus transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            Visit original source
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}