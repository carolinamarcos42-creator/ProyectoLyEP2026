import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ListaClientes from '../pages/ListaClientes'
import DetalleCliente from '../pages/DetalleCliente'
import ErrorPage from '../pages/ErrorPage'
import RutaProtegida from '../components/RutaProtegida'

// H23 (issue #14): se declara explícitamente qué roles pueden
// acceder a cada ruta protegida, en vez de dejarlo implícito.
const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RutaProtegida rolesPermitidos={['Soporte', 'Gerencia']}>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes"
        element={
          <RutaProtegida rolesPermitidos={['Soporte', 'Gerencia']}>
            <ListaClientes />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes/:id"
        element={
         <RutaProtegida rolesPermitidos={['Soporte', 'Gerencia']}>
          <DetalleCliente />
         </RutaProtegida>
      }
      />
      <Route path="*" element={<ErrorPage />} />

    </Routes>
  )
}
export default AppRoutes
