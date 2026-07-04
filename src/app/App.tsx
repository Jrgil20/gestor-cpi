import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import { isSupabaseConfigured } from '../lib/supabase'
import { syncFromCloud } from '../lib/sync'
import { useSession } from '../lib/useSession'
import ConfigNotice from './ConfigNotice'
import { router } from './router'

const queryClient = new QueryClient()

function ConfiguredApp() {
  const { session, loading } = useSession()

  useEffect(() => {
    if (!session) return
    // RF-012: respaldo local al iniciar sesión. No bloquea la UI: la nube
    // sigue siendo la fuente primaria (supuesto 4, no hay modo offline).
    syncFromCloud().catch((err) => {
      console.warn('No se pudo sincronizar el respaldo local:', err)
    })
  }, [session])

  if (loading) return <p>Cargando...</p>
  if (!session) return <LoginPage />

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigNotice />
  }

  return <ConfiguredApp />
}
