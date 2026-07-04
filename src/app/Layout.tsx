import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getUltimaSync } from '../lib/sync'

function RespaldoIndicator() {
  const ultima = getUltimaSync()
  if (!ultima) return null
  const hora = ultima.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <span className="muted respaldo-indicator" title="Última copia del respaldo local (RF-012)">
      Respaldo: {hora}
    </span>
  )
}

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/proveedores">Proveedores</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/pedidos">Pedidos</NavLink>
        <NavLink to="/pendientes">Pendientes</NavLink>
        <RespaldoIndicator />
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
