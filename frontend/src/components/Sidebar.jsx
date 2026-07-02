import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/roles', label: 'Role Management' },
  { to: '/admin/tasks', label: 'Tasks' },
  { to: '/admin/leaves', label: 'Leave Requests' },
  { to: '/admin/reports', label: 'Reports' }
]

const hrLinks = [
  { to: '/hr', label: 'Dashboard', end: true },
  { to: '/hr/employees', label: 'Employees' },
  { to: '/hr/leaves', label: 'Leave Requests' },
  { to: '/hr/reports', label: 'Reports' }
]

const employeeLinks = [
  { to: '/employee', label: 'My Profile', end: true },
  { to: '/employee/tasks', label: 'My Tasks' },
  { to: '/employee/leaves', label: 'My Leaves' }
]

const Sidebar = () => {
  const { user } = useAuth()
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'hr' ? hrLinks : employeeLinks

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
