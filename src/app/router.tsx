/* oxlint-disable react/only-export-components -- archivo de rutas: exporta el router, no participa en fast refresh */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const ProveedoresPage = lazy(() => import('../features/proveedores/ProveedoresPage'))
const ClientesPage = lazy(() => import('../features/clientes/ClientesPage'))
const ProductosPage = lazy(() => import('../features/productos/ProductosPage'))
const PedidosPage = lazy(() => import('../features/pedidos/PedidosPage'))
const PendientesPage = lazy(() => import('../features/pendientes/PendientesPage'))

function pagina(element: React.ReactNode) {
  return <Suspense fallback={<p>Cargando...</p>}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: pagina(<DashboardPage />) },
      { path: '/proveedores', element: pagina(<ProveedoresPage />) },
      { path: '/clientes', element: pagina(<ClientesPage />) },
      { path: '/productos', element: pagina(<ProductosPage />) },
      { path: '/pedidos', element: pagina(<PedidosPage />) },
      { path: '/pendientes', element: pagina(<PendientesPage />) },
    ],
  },
])
