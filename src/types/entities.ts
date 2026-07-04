// Tipos del modelo de datos (ver docs/06-arquitectura.md y supabase/schema.sql)

export type Moneda = 'USD' | 'BS'

export type EstadoPedido = 'registrado' | 'pendiente_entrega' | 'entregado' | 'anulado'

export interface Proveedor {
  id: string
  nombre: string
  contacto: string | null
  activo: boolean
  created_at: string
}

export interface Cliente {
  id: string
  nombre: string
  contacto: string | null
  activo: boolean
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  activo: boolean
  stock: number
  created_at: string
}

export interface Pedido {
  id: string
  tipo: 'compra' | 'venta'
  proveedor_id: string | null
  cliente_id: string | null
  estado: EstadoPedido
  moneda: Moneda
  tasa_bs_por_usd: number
  monto_total: number
  fecha: string
  created_at: string
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface Abono {
  id: string
  pedido_id: string
  monto: number
  moneda: Moneda
  tasa_bs_por_usd: number
  fecha: string
  created_at: string
}
