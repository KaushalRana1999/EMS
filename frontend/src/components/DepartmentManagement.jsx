import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Layout from './Layout'
import Loader from './Loader'
import Modal from './Modal'

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/departments')
      setDepartments(data.departments)
    } catch {
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (dept) => {
    setEditing(dept)
    setForm({ name: dept.name, description: dept.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form)
        toast.success('Department updated')
      } else {
        await api.post('/departments', form)
        toast.success('Department created')
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    try {
      await api.delete(`/departments/${id}`)
      toast.success('Department deleted')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Department
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="card">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                <span className="badge bg-primary-50 text-primary-600">{dept.employeeCount} employees</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{dept.description || 'No description'}</p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => openEdit(dept)} className="text-primary-600 hover:underline text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(dept._id)} className="text-red-600 hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {departments.length === 0 && <p className="text-gray-400">No departments yet.</p>}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Department' : 'Add Department'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Department Name</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

export default DepartmentManagement
