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
    `text-sm transition ${location.pathname === path ? 'text-focus font-medium' : 'text-slate hover:text-ink'}`

  return (
    <header className="border-b border-slate/15 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/feed" className="font-display text-2xl text-ink">Polaris</Link>
        <nav className="hidden sm:flex items-center gap-5">
          <Link to="/feed" className={linkClass('/feed')}>Feed</Link>
          <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
          <Link to="/library" className={linkClass('/library')}>Library</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate hidden sm:inline">
          Welcome, <span className="text-ink font-medium">{user?.first_name || '…'}</span>
        </span>
        {user?.profile_picture ? (
          <img src={user.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover border border-slate/20" />
        ) : (
          <span className="w-9 h-9 rounded-full bg-halo text-focus font-mono text-sm flex items-center justify-center border border-slate/20">
            {initials || '?'}
          </span>
        )}
        <button onClick={handleLogout} className="text-sm text-slate hover:text-ink transition">
          Log out
        </button>
      </div>
    </header>
  )
}