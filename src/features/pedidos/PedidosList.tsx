import { useState } from 'react'
import { aBs, aUsd } from '../../lib/money'
import type { PedidoConDetalle } from './api'
import { useMarcarVentaEntregada, usePedidos } from './usePedidos'

const ESTADO_LABEL: Record<string, string> = {
  registrado: 'Registrado',
  pendiente_entrega: 'Pendiente de entrega',
  entregado: 'Entregado',
  anulado: 'Anulado',
}

export function PedidosList() {
  const { data: pedidos, isLoading, error } = usePedidos()
  const marcarEntregada = useMarcarVentaEntregada()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p role="alert">No se pudo cargar la lista: {(error as Error).message}</p>
  if (!pedidos || pedidos.length === 0) return <p>Todavía no hay pedidos.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Contraparte</th>
          <th>Estado</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((pedido) => (
          <PedidoRow
            key={pedido.id}
            pedido={pedido}
            expanded={expandedId === pedido.id}
            onToggle={() => setExpandedId(expandedId === pedido.id ? null : pedido.id)}
            onMarcarEntregada={() => marcarEntregada.mutate(pedido.id)}
            marcandoEntregada={marcarEntregada.isPending}
          />
        ))}
      </tbody>
    </table>
  )
}

function PedidoRow({
  pedido,
  expanded,
  onToggle,
  onMarcarEntregada,
  marcandoEntregada,
}: {
  pedido: PedidoConDetalle
  expanded: boolean
  onToggle: () => void
  onMarcarEntregada: () => void
  marcandoEntregada: boolean
}) {
  const contraparte = pedido.proveedor?.nombre ?? pedido.cliente?.nombre ?? '—'
  const montoConTasa = {
    monto: pedido.monto_total,
    moneda: pedido.moneda,
    tasa_bs_por_usd: pedido.tasa_bs_por_usd,
  }

  return (
    <>
      <tr>
        <td>{pedido.fecha}</td>
        <td>{pedido.tipo === 'compra' ? 'Compra' : 'Venta'}</td>
        <td>{contraparte}</td>
        <td>{ESTADO_LABEL[pedido.estado]}</td>
        <td>
          {aUsd(montoConTasa).toFixed(2)} USD (≈ {aBs(montoConTasa).toFixed(2)} Bs)
        </td>
        <td>
          <button type="button" onClick={onToggle}>
            {expanded ? 'Ocultar' : 'Ver detalle'}
          </button>
          {pedido.tipo === 'venta' && pedido.estado === 'pendiente_entrega' && (
            <button type="button" onClick={onMarcarEntregada} disabled={marcandoEntregada}>
              Marcar entregado
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6}>
            <ul>
              {pedido.items.map((item, i) => (
                <li key={i}>
                  {item.producto?.nombre ?? 'Producto'} — {item.cantidad} x {item.precio_unitario}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  )
}
