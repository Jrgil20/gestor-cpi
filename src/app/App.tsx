import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { syncFromCloud } from '../lib/sync'
import ConfigNotice from './ConfigNotice'
import { router } from './router'

const queryClient = new QueryClient()

function ConfiguredApp() {
  useEffect(() => {
    // RF-012: respaldo local al iniciar. No bloquea la UI: la nube sigue
    // siendo la fuente primaria (supuesto 4, no hay modo offline).
    syncFromCloud().catch((err) => {
      console.warn('No se pudo sincronizar el respaldo local:', err)
    })
  }, [])

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
