import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
}

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })

  const loadLeaves = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/leaves')
      setLeaves(data.leaves)
    } catch {
      toast.error('Failed to load leave history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/leaves', form)
      toast.success('Leave request submitted')
      setModalOpen(false)
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })
      loadLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return
    try {
      await api.delete(`/leaves/${id}`)
      toast.success('Leave request cancelled')
      loadLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Apply for Leave
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id} className="border-t border-gray-100">
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
                  <td className="px-4 py-3 text-gray-500">{leave.reviewComment || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(leave._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No leave requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Apply for Leave"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Leave Type</label>
            <select
              className="input"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            >
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                required
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                required
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input"
              rows={3}
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

export default MyLeaves
