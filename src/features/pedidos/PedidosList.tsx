import { useState } from 'react'
import { aBs, aUsd, saldoUsd } from '../../lib/money'
import { AbonoForm } from './AbonoForm'
import type { PedidoConDetalle } from './api'
import {
  useAnularPedido,
  useEliminarAbono,
  useMarcarVentaEntregada,
  usePedidos,
} from './usePedidos'

const SALDO_EPSILON = 0.005

const ESTADO_LABEL: Record<string, string> = {
  registrado: 'Registrado',
  pendiente_entrega: 'Pendiente de entrega',
  entregado: 'Entregado',
  anulado: 'Anulado',
}

/** RF-009 (aviso, no bloqueo): productos cuya entrega dejaría stock negativo. */
function productosSinStock(pedido: PedidoConDetalle): string[] {
  return pedido.items
    .filter((item) => item.producto && item.producto.stock - item.cantidad < 0)
    .map((item) => item.producto!.nombre)
}

export function PedidosList() {
  const { data: pedidos, isLoading, error } = usePedidos()
  const marcarEntregada = useMarcarVentaEntregada()
  const anular = useAnularPedido()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p role="alert">No se pudo cargar la lista: {(error as Error).message}</p>
  if (!pedidos || pedidos.length === 0) return <p>Todavía no hay pedidos.</p>

  function handleMarcarEntregada(pedido: PedidoConDetalle) {
    const sinStock = productosSinStock(pedido)
    if (
      sinStock.length > 0 &&
      !confirm(`La entrega dejará stock negativo en: ${sinStock.join(', ')}. ¿Continuar?`)
    ) {
      return
    }
    marcarEntregada.mutate(pedido.id)
  }

  function handleAnular(pedido: PedidoConDetalle) {
    if (pedido.abonos.length > 0) {
      alert('El pedido tiene abonos: elimínalos antes de anular.')
      return
    }
    if (confirm('¿Anular este pedido? Su efecto en el stock se revertirá.')) {
      anular.mutate(pedido.id)
    }
  }

  return (
    <>
      {(marcarEntregada.isError || anular.isError) && (
        <p role="alert">
          {((marcarEntregada.error ?? anular.error) as Error).message}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Contraparte</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Saldo</th>
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
              onMarcarEntregada={() => handleMarcarEntregada(pedido)}
              onAnular={() => handleAnular(pedido)}
              mutando={marcarEntregada.isPending || anular.isPending}
            />
          ))}
        </tbody>
      </table>
    </>
  )
}

function PedidoRow({
  pedido,
  expanded,
  onToggle,
  onMarcarEntregada,
  onAnular,
  mutando,
}: {
  pedido: PedidoConDetalle
  expanded: boolean
  onToggle: () => void
  onMarcarEntregada: () => void
  onAnular: () => void
  mutando: boolean
}) {
  const eliminarAbono = useEliminarAbono()
  const contraparte = pedido.proveedor?.nombre ?? pedido.cliente?.nombre ?? '—'
  const montoConTasa = {
    monto: pedido.monto_total,
    moneda: pedido.moneda,
    tasa_bs_por_usd: pedido.tasa_bs_por_usd,
  }
  const saldo = saldoUsd(montoConTasa, pedido.abonos)
  const saldada = saldo <= SALDO_EPSILON
  const anulado = pedido.estado === 'anulado'

  function handleEliminarAbono(abonoId: string) {
    if (confirm('¿Eliminar este abono? El saldo del pedido se recalculará.')) {
      eliminarAbono.mutate(abonoId)
    }
  }

  return (
    <>
      <tr>
        <td>{pedido.fecha}</td>
        <td>{pedido.tipo === 'compra' ? 'Compra' : 'Venta'}</td>
        <td>{contraparte}</td>
        <td>
          <span className={`badge badge-${pedido.estado}`}>{ESTADO_LABEL[pedido.estado]}</span>
        </td>
        <td>
          {aUsd(montoConTasa).toFixed(2)} USD{' '}
          <span className="muted">(≈ {aBs(montoConTasa).toFixed(2)} Bs)</span>
        </td>
        <td>
          {anulado ? (
            <span className="muted">—</span>
          ) : saldada ? (
            <span className="badge badge-saldado">Saldado</span>
          ) : (
            <span className="badge badge-saldo">{saldo.toFixed(2)} USD</span>
          )}
        </td>
        <td>
          <button type="button" onClick={onToggle}>
            {expanded ? 'Ocultar' : 'Ver detalle'}
          </button>
          {pedido.tipo === 'venta' && pedido.estado === 'pendiente_entrega' && (
            <button type="button" onClick={onMarcarEntregada} disabled={mutando}>
              Marcar entregado
            </button>
          )}
          {!anulado && (
            <button type="button" onClick={onAnular} disabled={mutando}>
              Anular
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7}>
            <ul>
              {pedido.items.map((item, i) => (
                <li key={i}>
                  {item.producto?.nombre ?? 'Producto'} — {item.cantidad} x {item.precio_unitario}
                </li>
              ))}
            </ul>

            <h3>Abonos</h3>
            {pedido.abonos.length === 0 ? (
              <p>Sin abonos todavía.</p>
            ) : (
              <ul>
                {pedido.abonos.map((abono) => (
                  <li key={abono.id}>
                    {abono.monto} {abono.moneda}{' '}
                    {!anulado && (
                      <button
                        type="button"
                        onClick={() => handleEliminarAbono(abono.id)}
                        disabled={eliminarAbono.isPending}
                      >
                        Eliminar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {eliminarAbono.isError && (
              <p role="alert">No se pudo eliminar: {(eliminarAbono.error as Error).message}</p>
            )}
            {!saldada && !anulado && <AbonoForm pedidoId={pedido.id} saldo={saldo} />}
          </td>
        </tr>
      )}
    </>
  )
}
