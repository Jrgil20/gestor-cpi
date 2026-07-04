// RF-005 — Registro de pedidos de venta (puede quedar pendiente de entrega).
import { useState, type FormEvent } from 'react'
import type { Moneda } from '../../types/entities'
import type { PedidoItemInput } from './api'
import { PedidoItemsEditor } from './PedidoItemsEditor'
import { useClientesActivos, useCrearPedidoVenta, useProductosActivos } from './usePedidos'

const hoy = () => new Date().toISOString().slice(0, 10)

export function NuevoPedidoVentaForm() {
  const { data: clientes } = useClientesActivos()
  const { data: productos } = useProductosActivos()
  const crear = useCrearPedidoVenta()

  const [clienteId, setClienteId] = useState('')
  const [moneda, setMoneda] = useState<Moneda>('USD')
  const [tasa, setTasa] = useState(1)
  const [fecha, setFecha] = useState(hoy())
  const [entregaInmediata, setEntregaInmediata] = useState(false)
  const [items, setItems] = useState<PedidoItemInput[]>([])

  function reset() {
    setClienteId('')
    setItems([])
    setEntregaInmediata(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!clienteId || items.length === 0) return
    crear.mutate(
      { cliente_id: clienteId, moneda, tasa_bs_por_usd: tasa, fecha, entregaInmediata, items },
      { onSuccess: reset },
    )
  }

  if (!clientes || !productos) return <p>Cargando...</p>

  return (
    <form onSubmit={handleSubmit}>
      <div className="entity-form">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="" disabled>
            Selecciona un cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
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
        <label>
          <input
            type="checkbox"
            checked={entregaInmediata}
            onChange={(e) => setEntregaInmediata(e.target.checked)}
          />
          Entregar de inmediato (si no, queda pendiente de entrega)
        </label>
      </div>

      <PedidoItemsEditor productos={productos} items={items} onChange={setItems} />

      {crear.isError && <p role="alert">No se pudo registrar: {(crear.error as Error).message}</p>}

      <button type="submit" disabled={crear.isPending || !clienteId || items.length === 0}>
        Registrar venta
      </button>
    </form>
  )
}
