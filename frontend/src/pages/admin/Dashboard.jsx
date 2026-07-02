import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7']

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/analytics')
        setData(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Layout><Loader full /></Layout>
  if (!data) return <Layout><p>Failed to load analytics.</p></Layout>

  const { summary, departmentStats, roleStats, taskStats, leaveStats } = data

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={summary.totalEmployees} accent="primary" />
        <StatCard label="Departments" value={summary.totalDepartments} accent="green" />
        <StatCard label="Active Employees" value={summary.activeEmployees} accent="amber" />
        <StatCard label="Pending Leave Requests" value={summary.pendingLeaves} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Employees by Department</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Users by Role</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleStats} dataKey="count" nameKey="name" outerRadius={90} label>
                {roleStats.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Task Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Leave Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={leaveStats} dataKey="count" nameKey="name" outerRadius={90} label>
                {leaveStats.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
