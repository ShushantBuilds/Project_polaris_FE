import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()

  const linkClass = (path) =>
    `text-sm transition-all px-4 py-2 rounded-full ${location.pathname === path ? 'bg-white/60 font-medium text-focus shadow-sm' : 'text-slate hover:text-ink hover:bg-white/40'}`

  return (
    <header className="border-b border-slate/10 bg-white/30 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/feed" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-2xl text-ink tracking-tight">Polaris</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-2 bg-white/20 p-1 rounded-full border border-slate/10">
          <Link to="/feed" className={linkClass('/feed')}>Feed</Link>
          <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
          <Link to="/library" className={linkClass('/library')}>Library</Link>
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm text-slate hidden sm:inline font-mono tracking-wide">
          Welcome, <span className="text-ink font-medium">{user?.first_name || '…'}</span>
        </span>
        
        <div className="flex items-center gap-4">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-white/60 text-focus font-mono text-sm flex items-center justify-center border-2 border-white/50 shadow-sm">
              {initials || '?'}
            </span>
          )}
          <button onClick={handleLogout} className="text-xs font-mono uppercase tracking-widest text-slate hover:text-ink transition-colors border border-transparent hover:border-slate/20 px-3 py-1.5 rounded-full hover:bg-white/40">
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}