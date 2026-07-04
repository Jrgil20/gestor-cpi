// RNF-006 — Inicio de sesión. No hay auto-registro: el usuario se crea
// desde el dashboard de Supabase (Authentication → Users → Add user),
// coherente con "un solo usuario en el MVP" (docs/06-arquitectura.md).
import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="layout">
      <h1>Gestor-cpi</h1>
      <form onSubmit={handleSubmit} className="entity-form">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Iniciar sesión
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>El usuario se crea desde el dashboard de Supabase (Authentication → Users → Add user).</p>
    </div>
  )
}
