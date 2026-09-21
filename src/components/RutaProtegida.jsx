import { Navigate } from 'react-router-dom'
import useAutorizaciones from '../hooks/useAutorizaciones'

// H23 (issue #14): antes, RutaProtegida solo verificaba que hubiera
// sesión activa, sin validar el rol. Esto permitía que un admin con
// sector "Soporte" accediera a cualquier ruta protegida igual que uno
// con sector "Gerencia" (OWASP A01:2021 - Broken Access Control).
//
// Ahora cada ruta declara explícitamente en routes.jsx qué roles
// pueden acceder mediante la prop rolesPermitidos. Si no se pasa esa
// prop, el comportamiento es el mismo de antes (solo valida sesión).
// Si se pasa y el rol del admin no está incluido, se redirige a "/".
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
