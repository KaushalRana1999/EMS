import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'

const priorityColor = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
}

const statusColor = {
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const MyTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tasks')
      setTasks(data.tasks)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status })
      toast.success('Task status updated')
      loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="card">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                <span className={`badge ${priorityColor[task.priority]}`}>{task.priority}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{task.description || 'No description'}</p>
              <p className="text-xs text-gray-400 mt-2">
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`badge ${statusColor[task.status]}`}>{task.status}</span>
                <select
                  className="input w-auto text-sm"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-gray-400">No tasks assigned to you yet.</p>}
        </div>
      )}
    </Layout>
  )
}

export default MyTasks
