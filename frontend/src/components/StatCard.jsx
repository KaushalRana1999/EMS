const StatCard = ({ label, value, accent = 'primary' }) => {
  const accents = {
    primary: 'text-primary-600 bg-primary-50',
    green: 'text-green-600 bg-green-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50'
  }
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent].split(' ')[0]}`}>{value}</p>
    </div>
  )
}

export default StatCard
