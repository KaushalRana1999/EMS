import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Layout from './Layout'
import Loader from './Loader'

const Reports = () => {
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/reports')
        setReport(data.report)
      } catch {
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const exportCsv = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Leave Balance',
      'Leave Days Taken',
      'Total Tasks',
      'Completed Tasks',
      'Completion Rate (%)'
    ]
    const rows = report.map((r) => [
      r.employeeId,
      r.name,
      r.department,
      r.leaveBalance,
      r.leaveDaysTaken,
      r.totalTasks,
      r.completedTasks,
      r.completionRate
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ems-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance &amp; Performance Report</h1>
        <button onClick={exportCsv} className="btn-outline" disabled={!report.length}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Emp ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Leave Balance</th>
                <th className="px-4 py-3">Leave Taken</th>
                <th className="px-4 py-3">Tasks</th>
                <th className="px-4 py-3">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.employeeId} className="border-t border-gray-100">
                  <td className="px-4 py-3">{r.employeeId}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.department}</td>
                  <td className="px-4 py-3">{r.leaveBalance}</td>
                  <td className="px-4 py-3">{r.leaveDaysTaken}</td>
                  <td className="px-4 py-3">
                    {r.completedTasks}/{r.totalTasks}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${r.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{r.completionRate}%</span>
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default Reports
