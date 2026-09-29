import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M4 6h16M4 12h16M4 18h7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-wide text-slate-100">
          AI&ndash;SQL Assistant
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="text-sm text-slate-400">
            Hi, <span className="text-slate-200">{user.name}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
