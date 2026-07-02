const Loader = ({ full }) => (
  <div className={full ? 'min-h-screen flex items-center justify-center' : 'flex items-center justify-center py-10'}>
    <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
)

export default Loader
