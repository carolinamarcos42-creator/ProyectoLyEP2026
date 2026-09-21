import { Navigate } from 'react-router-dom'
import useAutorizaciones from '../hooks/useAutorizaciones'

// H23 (issue #14): RutaProtegida ahora puede recibir rolesPermitidos
// para validar el rol del admin, no solo si hay sesión activa.
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { admin } = useAutorizaciones()

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(admin.sector)) {
    return <Navigate to="/" replace />
  }

  return children
}
export default RutaProtegida
