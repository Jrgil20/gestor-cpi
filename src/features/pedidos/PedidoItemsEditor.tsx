// Editor de líneas de producto, compartido entre pedidos de compra y de venta.
import type { PedidoItemInput } from './api'

interface ProductoOpcion {
  id: string
  nombre: string
}

interface Props {
  productos: ProductoOpcion[]
  items: PedidoItemInput[]
  onChange: (items: PedidoItemInput[]) => void
}

export function PedidoItemsEditor({ productos, items, onChange }: Props) {
  function addRow() {
    if (productos.length === 0) return
    onChange([...items, { producto_id: productos[0].id, cantidad: 1, precio_unitario: 0 }])
  }

  function updateRow(index: number, patch: Partial<PedidoItemInput>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <select
                  value={item.producto_id}
                  onChange={(e) => updateRow(index, { producto_id: e.target.value })}
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min={0.01}
                  step="any"
                  value={item.cantidad}
                  onChange={(e) => updateRow(index, { cantidad: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={item.precio_unitario}
                  onChange={(e) => updateRow(index, { precio_unitario: Number(e.target.value) })}
                />
              </td>
              <td>{(item.cantidad * item.precio_unitario).toFixed(2)}</td>
              <td>
                <button type="button" onClick={() => removeRow(index)}>
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addRow} disabled={productos.length === 0}>
        + Agregar línea
      </button>
      <p>
        <strong>Total: {total.toFixed(2)}</strong>
      </p>
    </div>
  )
}
