import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

const queryKey = ['productos'] as const

export function useProductos() {
  return useQuery({ queryKey, queryFn: api.listProductos })
}

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crearProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useActualizarNombreProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      api.actualizarNombreProducto(id, nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useSetProductoActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      api.setProductoActivo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}
