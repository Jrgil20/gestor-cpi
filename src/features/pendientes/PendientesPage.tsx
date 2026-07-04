// F-09 — Vistas secundarias (RF-014): encargos pendientes de entrega y
// cuentas por cobrar ordenables. El historial de transacciones ya lo
// cubre el listado de Pedidos (F-02); aquí solo se filtra/ordena.
import { useState } from 'react'
import { mensajeDeError } from '../../lib/errores'
import { saldoUsd } from '../../lib/money'
import { usePedidos } from '../pedidos/usePedidos'

type SortKey = 'fecha' | 'saldo'
const SALDO_EPSILON = 0.005

export default function PendientesPage() {
  const { data: pedidos, isLoading, error } = usePedidos()
  const [sortKey, setSortKey] = useState<SortKey>('saldo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p role="alert">No se pudo cargar: {mensajeDeError(error)}</p>
  if (!pedidos) return <p>Cargando...</p>

  const ventas = pedidos.filter((p) => p.tipo === 'venta')
  const encargosPendientes = ventas.filter((p) => p.estado === 'pendiente_entrega')

  const cuentasPorCobrar = ventas
    .map((p) => ({
      id: p.id,
      cliente: p.cliente?.nombre ?? '—',
      fecha: p.fecha,
      saldo: saldoUsd(
        { monto: p.monto_total, moneda: p.moneda, tasa_bs_por_usd: p.tasa_bs_por_usd },
        p.abonos,
      ),
    }))
    .filter((c) => c.saldo > SALDO_EPSILON)
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      return sortKey === 'fecha' ? a.fecha.localeCompare(b.fecha) * dir : (a.saldo - b.saldo) * dir
    })

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function sortIndicator(key: SortKey) {
    return sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''
  }

  return (
    <section>
      <h1>Pendientes</h1>

      <h2>Encargos pendientes de entrega</h2>
      {encargosPendientes.length === 0 ? (
        <p>No hay encargos pendientes de entrega.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {encargosPendientes.map((p) => (
              <tr key={p.id}>
                <td>{p.fecha}</td>
                <td>{p.cliente?.nombre ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Pendientes por cobrar</h2>
      {cuentasPorCobrar.length === 0 ? (
        <p>No hay cuentas por cobrar pendientes.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th onClick={() => toggleSort('fecha')} style={{ cursor: 'pointer' }}>
                Fecha{sortIndicator('fecha')}
              </th>
              <th onClick={() => toggleSort('saldo')} style={{ cursor: 'pointer' }}>
                Saldo (USD){sortIndicator('saldo')}
              </th>
            </tr>
          </thead>
          <tbody>
            {cuentasPorCobrar.map((c) => (
              <tr key={c.id}>
                <td>{c.cliente}</td>
                <td>{c.fecha}</td>
                <td>{c.saldo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
