// Capa de datos compartida por proveedores y clientes (RF-001, RF-002): misma
// forma (nombre, contacto, activo), mismas operaciones. Productos difiere
// (sin contacto, con stock) y por eso tiene su propia implementación.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface SimpleEntity {
  id: string
  nombre: string
  contacto: string | null
  activo: boolean
  created_at: string
}

export interface SimpleEntityInput {
  nombre: string
  contacto: string | null
}

export function createSimpleEntityCrud<T extends SimpleEntity>(table: 'proveedores' | 'clientes') {
  const queryKey = [table] as const

  async function list(): Promise<T[]> {
    const { data, error } = await supabase.from(table).select('*').order('nombre')
    if (error) throw error
    return data as T[]
  }

  async function create(input: SimpleEntityInput): Promise<T> {
    const { data, error } = await supabase.from(table).insert(input).select().single()
    if (error) throw error
    return data as T
  }

  async function update(id: string, input: SimpleEntityInput): Promise<void> {
    const { error } = await supabase.from(table).update(input).eq('id', id)
    if (error) throw error
  }

  async function setActivo(id: string, activo: boolean): Promise<void> {
    const { error } = await supabase.from(table).update({ activo }).eq('id', id)
    if (error) throw error
  }

  function useList() {
    return useQuery({ queryKey, queryFn: list })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({ mutationFn: create, onSuccess: () => qc.invalidateQueries({ queryKey }) })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: SimpleEntityInput }) => update(id, input),
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    })
  }

  function useSetActivo() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, activo }: { id: string; activo: boolean }) => setActivo(id, activo),
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    })
  }

  return { useList, useCreate, useUpdate, useSetActivo }
}

export type SimpleEntityCrud<T extends SimpleEntity> = ReturnType<typeof createSimpleEntityCrud<T>>
