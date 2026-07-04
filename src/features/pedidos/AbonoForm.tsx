// RF-007 — Registrar un abono parcial sobre un pedido.
import { useState, type FormEvent } from 'react'
import type { Moneda } from '../../types/entities'
import { useCrearAbono } from './usePedidos'

const hoy = () => new Date().toISOString().slice(0, 10)

export function AbonoForm({ pedidoId }: { pedidoId: string }) {
  const crear = useCrearAbono()
  const [monto, setMonto] = useState(0)
  const [moneda, setMoneda] = useState<Moneda>('USD')
  const [tasa, setTasa] = useState(1)
  const [fecha, setFecha] = useState(hoy())

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (monto <= 0) return
    crear.mutate(
      { pedido_id: pedidoId, monto, moneda, tasa_bs_por_usd: tasa, fecha },
      { onSuccess: () => setMonto(0) },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <input
        type="number"
        min={0.01}
        step="any"
        placeholder="Monto del abono"
        value={monto || ''}
        onChange={(e) => setMonto(Number(e.target.value))}
        required
      />
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
      <button type="submit" disabled={crear.isPending || monto <= 0}>
        Registrar abono
      </button>
      {crear.isError && <p role="alert">No se pudo registrar: {(crear.error as Error).message}</p>}
    </form>
  )
}
