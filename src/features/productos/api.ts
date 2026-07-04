// F-01/F-05 — Gestión de productos (RF-003). El stock (RF-010) es de solo
// lectura aquí: se mueve con las compras/ventas (RF-009), no manualmente.
import { supabase } from '../../lib/supabase'
import type { Producto } from '../../types/entities'

export async function listProductos(): Promise<Producto[]> {
  const { data, error } = await supabase.from('productos').select('*').order('nombre')
  if (error) throw error
  return data as Producto[]
}

export async function crearProducto(nombre: string): Promise<Producto> {
  const { data, error } = await supabase.from('productos').insert({ nombre }).select().single()
  if (error) throw error
  return data as Producto
}

export async function actualizarNombreProducto(id: string, nombre: string): Promise<void> {
  const { error } = await supabase.from('productos').update({ nombre }).eq('id', id)
  if (error) throw error
}

export async function setProductoActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('productos').update({ activo }).eq('id', id)
  if (error) throw error
}
