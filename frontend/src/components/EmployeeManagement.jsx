import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Layout from './Layout'
import Loader from './Loader'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  firstName: '',
  lastName: '',
  phone: '',
  department: '',
  designation: '',
  employmentType: 'full-time',
  salary: '',
  bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '' }
}

const EmployeeManagement = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', { params: search ? { search } : {} }),
        api.get('/departments')
      ])
      setEmployees(empRes.data.employees)
      setDepartments(deptRes.data.departments)
    } catch (err) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    loadData()
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (emp) => {
    setEditing(emp)
    setForm({
      ...emptyForm,
      firstName: emp.firstName,
      lastName: emp.lastName,
      phone: emp.phone || '',
      department: emp.department?._id || '',
      designation: emp.designation || '',
      employmentType: emp.employmentType || 'full-time',
      salary: emp.salary || '',
      bankDetails: emp.bankDetails || emptyForm.bankDetails
    })
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('bank.')) {
      const key = name.split('.')[1]
      setForm((f) => ({ ...f, bankDetails: { ...f.bankDetails, [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const payload = { ...form }
        delete payload.name
        delete payload.email
        delete payload.password
        delete payload.role
        await api.put(`/employees/${editing._id}`, payload)
        toast.success('Employee updated')
      } else {
        await api.post('/employees', form)
        toast.success('Employee created')
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
    if (!window.confirm('Delete this employee? This will also remove their user account.')) return
    try {
      await api.delete(`/employees/${id}`)
      toast.success('Employee deleted')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add Employee
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-outline">
          Search
        </button>
      </form>

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
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    {emp.firstName} {emp.lastName}
                    <div className="text-xs text-gray-400">{emp.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">{emp.department?.name || '—'}</td>
                  <td className="px-4 py-3">{emp.designation || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(emp)} className="text-primary-600 hover:underline text-sm">
                      Edit
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Employee' : 'Add New Employee'}
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
          {!editing && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name (login)</label>
                  <input name="name" required className="input" value={form.name} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select name="role" className="input" value={form.role} onChange={handleFormChange}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="label">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="input"
                    value={form.password}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input
                name="firstName"
                required
                className="input"
                value={form.firstName}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                name="lastName"
                required
                className="input"
                value={form.lastName}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="input" value={form.phone} onChange={handleFormChange} />
            </div>
            <div>
              <label className="label">Department</label>
              <select name="department" className="input" value={form.department} onChange={handleFormChange}>
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Designation</label>
              <input
                name="designation"
                className="input"
                value={form.designation}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label className="label">Employment Type</label>
              <select
                name="employmentType"
                className="input"
                value={form.employmentType}
                onChange={handleFormChange}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Salary</label>
            <input
              type="number"
              name="salary"
              className="input"
              value={form.salary}
              onChange={handleFormChange}
            />
          </div>

          <fieldset className="border border-gray-200 rounded-lg p-3">
            <legend className="text-sm font-medium text-gray-600 px-1">Bank Details</legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="bank.accountHolderName"
                placeholder="Account Holder Name"
                className="input"
                value={form.bankDetails.accountHolderName}
                onChange={handleFormChange}
              />
              <input
                name="bank.accountNumber"
                placeholder="Account Number"
                className="input"
                value={form.bankDetails.accountNumber}
                onChange={handleFormChange}
              />
              <input
                name="bank.bankName"
                placeholder="Bank Name"
                className="input"
                value={form.bankDetails.bankName}
                onChange={handleFormChange}
              />
              <input
                name="bank.ifscCode"
                placeholder="IFSC Code"
                className="input"
                value={form.bankDetails.ifscCode}
                onChange={handleFormChange}
              />
            </div>
          </fieldset>
        </form>
      </Modal>
    </Layout>
  )
}

export default EmployeeManagement
