// F-02/F-05/F-03 — Pedidos de compra y venta con movimiento de stock
// (RF-004, RF-005, RF-009) y abonos parciales (RF-006, RF-007). El saldo no
// se almacena: se calcula con saldoUsd() a partir del pedido y sus abonos.
import { supabase } from '../../lib/supabase'
import type { Cliente, Moneda, Pedido, Proveedor } from '../../types/entities'
import type { MontoConTasa } from '../../lib/money'

export interface PedidoItemInput {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface PedidoItemDetalle {
  cantidad: number
  precio_unitario: number
  producto: { nombre: string; stock: number } | null
}

export interface AbonoResumen extends MontoConTasa {
  id: string
}

export interface PedidoConDetalle extends Pedido {
  proveedor: { nombre: string } | null
  cliente: { nombre: string } | null
  items: PedidoItemDetalle[]
  abonos: AbonoResumen[]
}

const PEDIDO_SELECT =
  '*, proveedor:proveedores(nombre), cliente:clientes(nombre), items:pedido_items(cantidad, precio_unitario, producto:productos(nombre, stock)), abonos:abonos(id, monto, moneda, tasa_bs_por_usd)'

export async function listPedidos(): Promise<PedidoConDetalle[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(PEDIDO_SELECT)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as PedidoConDetalle[]
}

export async function listProveedoresActivos(): Promise<Pick<Proveedor, 'id' | 'nombre'>[]> {
  const { data, error } = await supabase
    .from('proveedores')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

export async function listClientesActivos(): Promise<Pick<Cliente, 'id' | 'nombre'>[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

export async function listProductosActivos(): Promise<
  { id: string; nombre: string; stock: number }[]
> {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, stock')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

/** RF-007 (corrección): eliminar un abono mal capturado. */
export async function eliminarAbono(abonoId: string): Promise<void> {
  const { error } = await supabase.from('abonos').delete().eq('id', abonoId)
  if (error) throw error
}

export interface CrearPedidoCompraInput {
  proveedor_id: string
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
  items: PedidoItemInput[]
}

/** RF-004 + RF-009: registrar compra e ingresar el stock, en una transacción (RPC). */
export async function crearPedidoCompra(input: CrearPedidoCompraInput): Promise<void> {
  const { error } = await supabase.rpc('crear_pedido_compra', {
    p_proveedor_id: input.proveedor_id,
    p_moneda: input.moneda,
    p_tasa_bs_por_usd: input.tasa_bs_por_usd,
    p_fecha: input.fecha,
    p_items: input.items,
  })
  if (error) throw error
}

export interface CrearPedidoVentaInput {
  cliente_id: string
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
  entregaInmediata: boolean
  items: PedidoItemInput[]
}

/** RF-005 + RF-009: registrar venta (descuenta stock solo si se entrega), en una transacción (RPC). */
export async function crearPedidoVenta(input: CrearPedidoVentaInput): Promise<void> {
  const { error } = await supabase.rpc('crear_pedido_venta', {
    p_cliente_id: input.cliente_id,
    p_moneda: input.moneda,
    p_tasa_bs_por_usd: input.tasa_bs_por_usd,
    p_fecha: input.fecha,
    p_entrega_inmediata: input.entregaInmediata,
    p_items: input.items,
  })
  if (error) throw error
}

/** RF-009: entregar un encargo pendiente descontando stock, en una transacción (RPC). */
export async function marcarVentaEntregada(pedidoId: string): Promise<void> {
  const { error } = await supabase.rpc('marcar_venta_entregada', { p_pedido_id: pedidoId })
  if (error) throw error
}

/** Anular un pedido revirtiendo su efecto en stock; bloqueado si tiene abonos (RPC). */
export async function anularPedido(pedidoId: string): Promise<void> {
  const { error } = await supabase.rpc('anular_pedido', { p_pedido_id: pedidoId })
  if (error) throw error
}

export interface CrearAbonoInput {
  pedido_id: string
  monto: number
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
}

/** RF-007: abono parcial; el saldo restante se deriva, no se almacena. */
export async function crearAbono(input: CrearAbonoInput): Promise<void> {
  const { error } = await supabase.from('abonos').insert(input)
  if (error) throw error
}
