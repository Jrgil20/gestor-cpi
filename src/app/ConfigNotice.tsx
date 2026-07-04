// Guard de configuración: sin credenciales de Supabase la app no puede leer ni
// escribir datos (es un límite del sistema, no un modo de trabajo soportado).
export default function ConfigNotice() {
  return (
    <div className="auth-shell">
      <div className="auth-card config-card">
        <h1>Gestor-cpi</h1>
        <p>Falta configurar la conexión a Supabase.</p>
      <ol>
        <li>
          Copia <code>.env.example</code> a <code>.env</code>.
        </li>
        <li>
          Completa <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> con los
          datos de tu proyecto (Settings → API en el dashboard de Supabase).
        </li>
        <li>
          Aplica <code>supabase/schema.sql</code> en el SQL Editor del proyecto, si aún no lo
          hiciste.
        </li>
        <li>Reinicia el servidor de desarrollo.</li>
        </ol>
      </div>
    </div>
  )
}
