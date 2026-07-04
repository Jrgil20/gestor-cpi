// F-06 — Dashboard principal (RF-011): saldos por cliente, por proveedor y
// stock disponible. Los saldos se derivan de pedidos + abonos (RF-006/007).
import { supabase } from '../../lib/supabase'
import type { Moneda } from '../../types/entities'

export interface PedidoParaSaldo {
  tipo: 'compra' | 'venta'
  proveedor: { nombre: string } | null
  cliente: { nombre: string } | null
  monto_total: number
  moneda: Moneda
  tasa_bs_por_usd: number
  abonos: { monto: number; moneda: Moneda; tasa_bs_por_usd: number }[]
}

export async function listPedidosParaSaldos(): Promise<PedidoParaSaldo[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      'tipo, proveedor:proveedores(nombre), cliente:clientes(nombre), monto_total, moneda, tasa_bs_por_usd, abonos:abonos(monto, moneda, tasa_bs_por_usd)',
    )
    .neq('estado', 'anulado')
  if (error) throw error
  return data as unknown as PedidoParaSaldo[]
}

export interface ProductoConStock {
  id: string
  nombre: string
  stock: number
}

export async function listProductosConStock(): Promise<ProductoConStock[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, stock')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}
