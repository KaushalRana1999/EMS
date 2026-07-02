export const roleHome = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'hr') return '/hr'
  return '/employee'
}
