// F-07 — Respaldo local sincronizado al iniciar la app (RF-012). Pull
// completo de las 6 tablas: con el volumen esperado (RNF-002, centenares de
// registros) una sincronización incremental sería complejidad innecesaria.
import { localdb } from './localdb'
import { supabase } from './supabase'
import type { Abono, Cliente, Pedido, PedidoItem, Producto, Proveedor } from '../types/entities'

async function pull<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data as T[]
}

const ULTIMA_SYNC_KEY = 'gestor-cpi:ultima-sync'

/** Momento del último respaldo exitoso, o null si nunca se ha hecho. */
export function getUltimaSync(): Date | null {
  const valor = localStorage.getItem(ULTIMA_SYNC_KEY)
  return valor ? new Date(valor) : null
}

export async function syncFromCloud(): Promise<void> {
  const [proveedores, clientes, productos, pedidos, pedidoItems, abonos] = await Promise.all([
    pull<Proveedor>('proveedores'),
    pull<Cliente>('clientes'),
    pull<Producto>('productos'),
    pull<Pedido>('pedidos'),
    pull<PedidoItem>('pedido_items'),
    pull<Abono>('abonos'),
  ])

  await localdb.transaction(
    'rw',
    [
      localdb.proveedores,
      localdb.clientes,
      localdb.productos,
      localdb.pedidos,
      localdb.pedido_items,
      localdb.abonos,
    ],
    async () => {
      await Promise.all([
        localdb.proveedores.clear(),
        localdb.clientes.clear(),
        localdb.productos.clear(),
        localdb.pedidos.clear(),
        localdb.pedido_items.clear(),
        localdb.abonos.clear(),
      ])
      await Promise.all([
        localdb.proveedores.bulkAdd(proveedores),
        localdb.clientes.bulkAdd(clientes),
        localdb.productos.bulkAdd(productos),
        localdb.pedidos.bulkAdd(pedidos),
        localdb.pedido_items.bulkAdd(pedidoItems),
        localdb.abonos.bulkAdd(abonos),
      ])
    },
  )

  localStorage.setItem(ULTIMA_SYNC_KEY, new Date().toISOString())
}
