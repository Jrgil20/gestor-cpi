// F-02/F-05/F-03 — Pedidos de compra y venta con movimiento de stock
// (RF-004, RF-005, RF-009) y abonos parciales (RF-006, RF-007). El saldo no
// se almacena: se calcula con saldoUsd() a partir del pedido y sus abonos.
import { supabase } from '../../lib/supabase'
import type { Cliente, EstadoPedido, Moneda, Pedido, Proveedor } from '../../types/entities'
import type { MontoConTasa } from '../../lib/money'

export interface PedidoItemInput {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface PedidoItemDetalle {
  cantidad: number
  precio_unitario: number
  producto: { nombre: string } | null
}

export interface PedidoConDetalle extends Pedido {
  proveedor: { nombre: string } | null
  cliente: { nombre: string } | null
  items: PedidoItemDetalle[]
  abonos: MontoConTasa[]
}

const PEDIDO_SELECT =
  '*, proveedor:proveedores(nombre), cliente:clientes(nombre), items:pedido_items(cantidad, precio_unitario, producto:productos(nombre)), abonos:abonos(monto, moneda, tasa_bs_por_usd)'

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

export async function listProductosActivos(): Promise<{ id: string; nombre: string }[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

function montoTotal(items: PedidoItemInput[]): number {
  return items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)
}

async function insertPedidoConItems(
  pedido: {
    tipo: 'compra' | 'venta'
    proveedor_id: string | null
    cliente_id: string | null
    estado: EstadoPedido
    moneda: Moneda
    tasa_bs_por_usd: number
    fecha: string
  },
  items: PedidoItemInput[],
): Promise<string> {
  const { data, error } = await supabase
    .from('pedidos')
    .insert({ ...pedido, monto_total: montoTotal(items) })
    .select('id')
    .single()
  if (error) throw error

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(items.map((item) => ({ ...item, pedido_id: data.id })))
  if (itemsError) throw itemsError

  return data.id as string
}

async function adjustStock(producto_id: string, delta: number): Promise<void> {
  const { error } = await supabase.rpc('adjust_stock', { p_producto_id: producto_id, delta })
  if (error) throw error
}

export interface CrearPedidoCompraInput {
  proveedor_id: string
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
  items: PedidoItemInput[]
}

/** RF-004 + RF-009: registrar compra e ingresar el stock comprado de inmediato. */
export async function crearPedidoCompra(input: CrearPedidoCompraInput): Promise<void> {
  await insertPedidoConItems(
    {
      tipo: 'compra',
      proveedor_id: input.proveedor_id,
      cliente_id: null,
      estado: 'registrado',
      moneda: input.moneda,
      tasa_bs_por_usd: input.tasa_bs_por_usd,
      fecha: input.fecha,
    },
    input.items,
  )

  for (const item of input.items) {
    await adjustStock(item.producto_id, item.cantidad)
  }
}

export interface CrearPedidoVentaInput {
  cliente_id: string
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
  entregaInmediata: boolean
  items: PedidoItemInput[]
}

/** RF-005 + RF-009: registrar venta; solo descuenta stock si se entrega de inmediato. */
export async function crearPedidoVenta(input: CrearPedidoVentaInput): Promise<void> {
  const estado: EstadoPedido = input.entregaInmediata ? 'entregado' : 'pendiente_entrega'

  await insertPedidoConItems(
    {
      tipo: 'venta',
      proveedor_id: null,
      cliente_id: input.cliente_id,
      estado,
      moneda: input.moneda,
      tasa_bs_por_usd: input.tasa_bs_por_usd,
      fecha: input.fecha,
    },
    input.items,
  )

  if (input.entregaInmediata) {
    for (const item of input.items) {
      await adjustStock(item.producto_id, -item.cantidad)
    }
  }
}

/** RF-009: al entregar un encargo pendiente, ahora sí se descuenta el stock. */
export async function marcarVentaEntregada(pedidoId: string): Promise<void> {
  const { data: items, error } = await supabase
    .from('pedido_items')
    .select('producto_id, cantidad')
    .eq('pedido_id', pedidoId)
  if (error) throw error

  for (const item of items) {
    await adjustStock(item.producto_id, -item.cantidad)
  }

  const { error: updateError } = await supabase
    .from('pedidos')
    .update({ estado: 'entregado' })
    .eq('id', pedidoId)
  if (updateError) throw updateError
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
