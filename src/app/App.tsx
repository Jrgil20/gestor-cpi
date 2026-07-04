import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import ConfigNotice from './ConfigNotice'
import { router } from './router'

const queryClient = new QueryClient()

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigNotice />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
