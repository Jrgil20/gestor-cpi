import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

const pedidosKey = ['pedidos'] as const
const productosKey = ['productos'] as const

export function usePedidos() {
  return useQuery({ queryKey: pedidosKey, queryFn: api.listPedidos })
}

export function useProveedoresActivos() {
  return useQuery({ queryKey: ['proveedores', 'activos'], queryFn: api.listProveedoresActivos })
}

export function useClientesActivos() {
  return useQuery({ queryKey: ['clientes', 'activos'], queryFn: api.listClientesActivos })
}

export function useProductosActivos() {
  return useQuery({ queryKey: ['productos', 'activos'], queryFn: api.listProductosActivos })
}

export function useCrearPedidoCompra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crearPedidoCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pedidosKey })
      qc.invalidateQueries({ queryKey: productosKey })
    },
  })
}

export function useCrearPedidoVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crearPedidoVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pedidosKey })
      qc.invalidateQueries({ queryKey: productosKey })
    },
  })
}

export function useMarcarVentaEntregada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.marcarVentaEntregada,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pedidosKey })
      qc.invalidateQueries({ queryKey: productosKey })
    },
  })
}

export function useCrearAbono() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crearAbono,
    onSuccess: () => qc.invalidateQueries({ queryKey: pedidosKey }),
  })
}
