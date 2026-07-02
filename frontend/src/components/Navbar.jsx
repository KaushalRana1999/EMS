import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleBadge = {
  admin: 'bg-purple-100 text-purple-700',
  hr: 'bg-amber-100 text-amber-700',
  employee: 'bg-blue-100 text-blue-700'
}

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
          EMS
        </div>
        <span className="font-semibold text-gray-800 hidden sm:block">Employee Management System</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className={`badge ${roleBadge[user.role]}`}>{user.role.toUpperCase()}</span>
          <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
          <button onClick={handleLogout} className="btn-outline text-sm">
            Logout
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar
