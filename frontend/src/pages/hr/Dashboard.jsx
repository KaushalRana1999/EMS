import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import StatCard from '../../components/StatCard'

const HrDashboard = () => {
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

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">HR Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={data.summary.totalEmployees} accent="primary" />
        <StatCard label="Departments" value={data.summary.totalDepartments} accent="green" />
        <StatCard label="Active Employees" value={data.summary.activeEmployees} accent="amber" />
        <StatCard label="Pending Leave Requests" value={data.summary.pendingLeaves} accent="red" />
      </div>
      <p className="text-gray-500 text-sm mt-6">
        Use the sidebar to add new employees, review leave requests, and generate reports.
      </p>
    </Layout>
  )
}

export default HrDashboard
