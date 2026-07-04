// Respaldo local (F-07, RF-012): espejo de solo lectura de las tablas de Supabase,
// refrescado al iniciar la app. No es modo de trabajo offline (supuesto 4).
import Dexie, { type EntityTable } from 'dexie'
import type { Abono, Cliente, Pedido, PedidoItem, Producto, Proveedor } from '../types/entities'

export const localdb = new Dexie('gestor-cpi') as Dexie & {
  proveedores: EntityTable<Proveedor, 'id'>
  clientes: EntityTable<Cliente, 'id'>
  productos: EntityTable<Producto, 'id'>
  pedidos: EntityTable<Pedido, 'id'>
  pedido_items: EntityTable<PedidoItem, 'id'>
  abonos: EntityTable<Abono, 'id'>
}

localdb.version(1).stores({
  proveedores: 'id',
  clientes: 'id',
  productos: 'id',
  pedidos: 'id, proveedor_id, cliente_id',
  pedido_items: 'id, pedido_id',
  abonos: 'id, pedido_id',
})
