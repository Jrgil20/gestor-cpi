// F-01/F-05 — Gestión de productos y stock (RF-003, RF-010).
import { useState, type FormEvent } from 'react'
import { mensajeDeError } from '../../lib/errores'
import type { Producto } from '../../types/entities'
import {
  useActualizarNombreProducto,
  useCrearProducto,
  useProductos,
  useSetProductoActivo,
} from './useProductos'

export default function ProductosPage() {
  const { data: productos, isLoading, error } = useProductos()
  const crear = useCrearProducto()
  const [nombre, setNombre] = useState('')

  function handleCrear(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    crear.mutate(nombre.trim(), { onSuccess: () => setNombre('') })
  }

  return (
    <section>
      <h1>Productos</h1>

      <form onSubmit={handleCrear} className="entity-form">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <button type="submit" disabled={crear.isPending}>
          Agregar
        </button>
      </form>
      {crear.isError && <p role="alert">No se pudo crear: {mensajeDeError(crear.error)}</p>}

      {isLoading && <p>Cargando...</p>}
      {error && <p role="alert">No se pudo cargar la lista: {mensajeDeError(error)}</p>}
      {productos && <ProductosTable productos={productos} />}
    </section>
  )
}

function ProductosTable({ productos }: { productos: Producto[] }) {
  const actualizar = useActualizarNombreProducto()
  const setActivo = useSetProductoActivo()
  const [editId, setEditId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')

  function startEdit(p: Producto) {
    setEditId(p.id)
    setEditNombre(p.nombre)
  }

  function saveEdit(id: string) {
    actualizar.mutate({ id, nombre: editNombre.trim() }, { onSuccess: () => setEditId(null) })
  }

  if (productos.length === 0) {
    return <p>Todavía no hay productos.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Stock</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) =>
          editId === p.id ? (
            <tr key={p.id}>
              <td>
                <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </td>
              <td>{p.stock}</td>
              <td><span className={p.activo ? 'badge badge-activo' : 'badge badge-inactivo'}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>
                <button onClick={() => saveEdit(p.id)} disabled={actualizar.isPending}>
                  Guardar
                </button>
                <button onClick={() => setEditId(null)}>Cancelar</button>
              </td>
            </tr>
          ) : (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td><span className={p.activo ? 'badge badge-activo' : 'badge badge-inactivo'}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>
                <button onClick={() => startEdit(p)}>Editar</button>
                <button onClick={() => setActivo.mutate({ id: p.id, activo: !p.activo })}>
                  {p.activo ? 'Desactivar' : 'Reactivar'}
                </button>
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}
