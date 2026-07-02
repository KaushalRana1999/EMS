import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Layout from './Layout'
import Loader from './Loader'

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
}

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const loadData = async (status) => {
    setLoading(true)
    try {
      const { data } = await api.get('/leaves', { params: status ? { status } : {} })
      setLeaves(data.leaves)
    } catch {
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleReview = async (id, status) => {
    const reviewComment = window.prompt(
      `Add a comment for this ${status === 'approved' ? 'approval' : 'rejection'} (optional):`
    )
    try {
      await api.put(`/leaves/${id}/review`, { status, reviewComment: reviewComment || '' })
      toast.success(`Leave request ${status}`)
      loadData(filter)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed')
    }
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </td>
                  <td className="px-4 py-3 capitalize">{leave.leaveType}</td>
                  <td className="px-4 py-3">
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{leave.days}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor[leave.status]}`}>{leave.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReview(leave._id, 'approved')}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(leave._id, 'rejected')}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No leave requests found
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

export default LeaveApprovals
