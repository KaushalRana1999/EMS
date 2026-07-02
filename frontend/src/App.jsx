import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import { roleHome } from './utils/roleHome'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Unauthorized from './pages/Unauthorized'

import AdminDashboard from './pages/admin/Dashboard'
import AdminEmployees from './pages/admin/Employees'
import AdminDepartments from './pages/admin/Departments'
import AdminRoles from './pages/admin/RoleManagement'
import AdminTasks from './pages/admin/Tasks'
import AdminLeaves from './pages/admin/Leaves'
import AdminReports from './pages/admin/Reports'

import HrDashboard from './pages/hr/Dashboard'
import HrEmployees from './pages/hr/Employees'
import HrLeaves from './pages/hr/Leaves'
import HrReports from './pages/hr/Reports'

import EmployeeProfile from './pages/employee/Profile'
import EmployeeTasks from './pages/employee/Tasks'
import EmployeeLeaves from './pages/employee/Leaves'

function App() {
  const { user, loading } = useAuth()

  if (loading) return <Loader full />

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={roleHome(user.role)} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={roleHome(user.role)} /> : <Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute roles={['admin']}><AdminEmployees /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><AdminDepartments /></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute roles={['admin']}><AdminRoles /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute roles={['admin']}><AdminTasks /></ProtectedRoute>} />
        <Route path="/admin/leaves" element={<ProtectedRoute roles={['admin']}><AdminLeaves /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

        {/* HR routes */}
        <Route path="/hr" element={<ProtectedRoute roles={['hr']}><HrDashboard /></ProtectedRoute>} />
        <Route path="/hr/employees" element={<ProtectedRoute roles={['hr']}><HrEmployees /></ProtectedRoute>} />
        <Route path="/hr/leaves" element={<ProtectedRoute roles={['hr']}><HrLeaves /></ProtectedRoute>} />
        <Route path="/hr/reports" element={<ProtectedRoute roles={['hr']}><HrReports /></ProtectedRoute>} />

        {/* Employee routes */}
        <Route
          path="/employee"
          element={<ProtectedRoute roles={['employee', 'admin', 'hr']}><EmployeeProfile /></ProtectedRoute>}
        />
        <Route
          path="/employee/tasks"
          element={<ProtectedRoute roles={['employee', 'admin', 'hr']}><EmployeeTasks /></ProtectedRoute>}
        />
        <Route
          path="/employee/leaves"
          element={<ProtectedRoute roles={['employee', 'admin', 'hr']}><EmployeeLeaves /></ProtectedRoute>}
        />

        <Route path="/" element={<Navigate to={user ? roleHome(user.role) : '/login'} />} />
        <Route path="*" element={<Navigate to={user ? roleHome(user.role) : '/login'} />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  )
}

export default App
