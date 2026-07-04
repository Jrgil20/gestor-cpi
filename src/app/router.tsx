import { createBrowserRouter, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProveedoresPage from '../features/proveedores/ProveedoresPage'
import ClientesPage from '../features/clientes/ClientesPage'
import ProductosPage from '../features/productos/ProductosPage'
import PedidosPage from '../features/pedidos/PedidosPage'
import PendientesPage from '../features/pendientes/PendientesPage'

function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/proveedores">Proveedores</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/pedidos">Pedidos</NavLink>
        <NavLink to="/pendientes">Pendientes</NavLink>
        <button type="button" onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/proveedores', element: <ProveedoresPage /> },
      { path: '/clientes', element: <ClientesPage /> },
      { path: '/productos', element: <ProductosPage /> },
      { path: '/pedidos', element: <PedidosPage /> },
      { path: '/pendientes', element: <PendientesPage /> },
    ],
  },
])
