// RF-004 — Registro de pedidos de compra.
import { useState, type FormEvent } from 'react'
import { hoyLocal } from '../../lib/fecha'
import type { Moneda } from '../../types/entities'
import type { PedidoItemInput } from './api'
import { PedidoItemsEditor } from './PedidoItemsEditor'
import { useCrearPedidoCompra, useProductosActivos, useProveedoresActivos } from './usePedidos'

export function NuevoPedidoCompraForm() {
  const { data: proveedores } = useProveedoresActivos()
  const { data: productos } = useProductosActivos()
  const crear = useCrearPedidoCompra()

  const [proveedorId, setProveedorId] = useState('')
  const [moneda, setMoneda] = useState<Moneda>('USD')
  const [tasa, setTasa] = useState(1)
  const [fecha, setFecha] = useState(hoyLocal())
  const [items, setItems] = useState<PedidoItemInput[]>([])

  function reset() {
    setProveedorId('')
    setItems([])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!proveedorId || items.length === 0) return
    crear.mutate(
      { proveedor_id: proveedorId, moneda, tasa_bs_por_usd: tasa, fecha, items },
      { onSuccess: reset },
    )
  }

  if (!proveedores || !productos) return <p>Cargando...</p>

  return (
    <form onSubmit={handleSubmit}>
      <div className="entity-form">
        <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required>
          <option value="" disabled>
            Selecciona un proveedor
          </option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)}>
          <option value="USD">USD</option>
          <option value="BS">Bs</option>
        </select>
        <input
          type="number"
          min={0.01}
          step="any"
          title="Tasa Bs por USD"
          value={tasa}
          onChange={(e) => setTasa(Number(e.target.value))}
        />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      <PedidoItemsEditor productos={productos} items={items} onChange={setItems} />

      {crear.isError && <p role="alert">No se pudo registrar: {(crear.error as Error).message}</p>}

      <button type="submit" disabled={crear.isPending || !proveedorId || items.length === 0}>
        Registrar compra
      </button>
    </form>
  )
}
