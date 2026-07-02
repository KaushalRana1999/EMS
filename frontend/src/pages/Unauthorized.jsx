import { Link } from 'react-router-dom'

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800">403</h1>
      <p className="text-gray-500 mt-2">You are not authorized to view this page.</p>
      <Link to="/" className="btn-primary inline-block mt-6">
        Go Home
      </Link>
    </div>
  </div>
)

export default Unauthorized
