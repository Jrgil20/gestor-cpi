import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProveedoresPage from '../features/proveedores/ProveedoresPage'
import ClientesPage from '../features/clientes/ClientesPage'
import ProductosPage from '../features/productos/ProductosPage'
import PedidosPage from '../features/pedidos/PedidosPage'
import PendientesPage from '../features/pendientes/PendientesPage'

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
