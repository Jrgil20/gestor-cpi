import { useQuery } from '@tanstack/react-query'
import * as api from './api'

// Prefijo ['pedidos'] / ['productos']: las mutaciones de pedidos y abonos
// invalidan ese prefijo, así que este dashboard se refresca junto con ellas.
export function usePedidosParaSaldos() {
  return useQuery({ queryKey: ['pedidos', 'saldos'], queryFn: api.listPedidosParaSaldos })
}

export function useProductosConStock() {
  return useQuery({ queryKey: ['productos', 'stock'], queryFn: api.listProductosConStock })
}
