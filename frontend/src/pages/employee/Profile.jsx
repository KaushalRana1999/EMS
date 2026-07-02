import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/employees/${user.employee._id || user.employee}`)
      setEmployee(data.employee)
      setForm({
        phone: data.employee.phone || '',
        address: data.employee.address || '',
        dob: data.employee.dob ? data.employee.dob.slice(0, 10) : '',
        gender: data.employee.gender || '',
        bankDetails: data.employee.bankDetails || {}
      })
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('bank.')) {
      const key = name.split('.')[1]
      setForm((f) => ({ ...f, bankDetails: { ...f.bankDetails, [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/employees/${employee._id}`, form)
      toast.success('Profile updated')
      setEditing(false)
      loadProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><Loader full /></Layout>
  if (!employee) return <Layout><p>Profile not found.</p></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <button className="btn-outline" onClick={() => setEditing((e) => !e)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 text-center">
          <div className="h-20 w-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto">
            {employee.firstName?.[0]}
            {employee.lastName?.[0]}
          </div>
          <h2 className="mt-3 font-semibold text-lg">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-sm text-gray-500">{employee.designation || 'No designation set'}</p>
          <p className="text-xs text-gray-400 mt-1">{employee.employeeId}</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-left text-sm space-y-1">
            <p>
              <span className="text-gray-500">Department:</span> {employee.department?.name || '—'}
            </p>
            <p>
              <span className="text-gray-500">Employment:</span> {employee.employmentType}
            </p>
            <p>
              <span className="text-gray-500">Leave Balance:</span> {employee.leaveBalance} days
            </p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" className="input" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="input"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Gender</label>
                  <select name="gender" className="input" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Address</label>
                  <input name="address" className="input" value={form.address} onChange={handleChange} />
                </div>
              </div>

              <fieldset className="border border-gray-200 rounded-lg p-3">
                <legend className="text-sm font-medium text-gray-600 px-1">Bank Details</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="bank.accountHolderName"
                    placeholder="Account Holder Name"
                    className="input"
                    value={form.bankDetails?.accountHolderName || ''}
                    onChange={handleChange}
                  />
                  <input
                    name="bank.accountNumber"
                    placeholder="Account Number"
                    className="input"
                    value={form.bankDetails?.accountNumber || ''}
                    onChange={handleChange}
                  />
                  <input
                    name="bank.bankName"
                    placeholder="Bank Name"
                    className="input"
                    value={form.bankDetails?.bankName || ''}
                    onChange={handleChange}
                  />
                  <input
                    name="bank.ifscCode"
                    placeholder="IFSC Code"
                    className="input"
                    value={form.bankDetails?.ifscCode || ''}
                    onChange={handleChange}
                  />
                </div>
              </fieldset>

              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <p className="text-gray-500">Phone</p>
              <p>{employee.phone || '—'}</p>
              <p className="text-gray-500">Date of Birth</p>
              <p>{employee.dob ? new Date(employee.dob).toLocaleDateString() : '—'}</p>
              <p className="text-gray-500">Gender</p>
              <p className="capitalize">{employee.gender || '—'}</p>
              <p className="text-gray-500">Address</p>
              <p>{employee.address || '—'}</p>
              <p className="text-gray-500">Bank Account</p>
              <p>{employee.bankDetails?.accountNumber || '—'}</p>
              <p className="text-gray-500">Bank Name</p>
              <p>{employee.bankDetails?.bankName || '—'}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Profile
