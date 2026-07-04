import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
