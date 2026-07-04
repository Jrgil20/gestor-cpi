import { useState, type FormEvent } from 'react'
import type { SimpleEntity, SimpleEntityCrud } from './entityCrud'

interface PageProps<T extends SimpleEntity> {
  title: string
  crud: SimpleEntityCrud<T>
}

export function SimpleEntityCrudPage<T extends SimpleEntity>({ title, crud }: PageProps<T>) {
  const { data: items, isLoading, error } = crud.useList()
  const crear = crud.useCreate()
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')

  function handleCrear(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    crear.mutate(
      { nombre: nombre.trim(), contacto: contacto.trim() || null },
      {
        onSuccess: () => {
          setNombre('')
          setContacto('')
        },
      },
    )
  }

  return (
    <section>
      <h1>{title}</h1>

      <form onSubmit={handleCrear} className="entity-form">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          placeholder="Contacto (opcional)"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />
        <button type="submit" disabled={crear.isPending}>
          Agregar
        </button>
      </form>
      {crear.isError && <p role="alert">No se pudo crear: {(crear.error as Error).message}</p>}

      {isLoading && <p>Cargando...</p>}
      {error && <p role="alert">No se pudo cargar la lista: {(error as Error).message}</p>}
      {items && <SimpleEntityTable items={items} crud={crud} />}
    </section>
  )
}

function SimpleEntityTable<T extends SimpleEntity>({
  items,
  crud,
}: {
  items: T[]
  crud: SimpleEntityCrud<T>
}) {
  const actualizar = crud.useUpdate()
  const setActivo = crud.useSetActivo()
  const [editId, setEditId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editContacto, setEditContacto] = useState('')

  function startEdit(item: T) {
    setEditId(item.id)
    setEditNombre(item.nombre)
    setEditContacto(item.contacto ?? '')
  }

  function saveEdit(id: string) {
    actualizar.mutate(
      { id, input: { nombre: editNombre.trim(), contacto: editContacto.trim() || null } },
      { onSuccess: () => setEditId(null) },
    )
  }

  if (items.length === 0) {
    return <p>Todavía no hay registros.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Contacto</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) =>
          editId === item.id ? (
            <tr key={item.id}>
              <td>
                <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </td>
              <td>
                <input value={editContacto} onChange={(e) => setEditContacto(e.target.value)} />
              </td>
              <td>{item.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => saveEdit(item.id)} disabled={actualizar.isPending}>
                  Guardar
                </button>
                <button onClick={() => setEditId(null)}>Cancelar</button>
              </td>
            </tr>
          ) : (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.contacto ?? '—'}</td>
              <td>{item.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => startEdit(item)}>Editar</button>
                <button onClick={() => setActivo.mutate({ id: item.id, activo: !item.activo })}>
                  {item.activo ? 'Desactivar' : 'Reactivar'}
                </button>
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}
