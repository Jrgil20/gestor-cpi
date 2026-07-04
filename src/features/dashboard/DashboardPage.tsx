// F-06 — Dashboard principal (RF-011).
import { saldoUsd } from '../../lib/money'
import type { PedidoParaSaldo } from './api'
import { usePedidosParaSaldos, useProductosConStock } from './useDashboard'

const EPSILON = 0.005

export default function DashboardPage() {
  const { data: pedidos, error: errorPedidos } = usePedidosParaSaldos()
  const { data: productos, error: errorProductos } = useProductosConStock()

  if (errorPedidos) {
    return <p role="alert">No se pudo cargar los saldos: {(errorPedidos as Error).message}</p>
  }
  if (errorProductos) {
    return <p role="alert">No se pudo cargar el stock: {(errorProductos as Error).message}</p>
  }
  if (!pedidos || !productos) return <p>Cargando...</p>

  const saldosPorCliente = agruparSaldos(
    pedidos.filter((p) => p.tipo === 'venta'),
    (p) => p.cliente?.nombre,
  )
  const saldosPorProveedor = agruparSaldos(
    pedidos.filter((p) => p.tipo === 'compra'),
    (p) => p.proveedor?.nombre,
  )

  return (
    <section>
      <h1>Dashboard</h1>

      <h2>Me deben (clientes)</h2>
      <SaldosTable saldos={saldosPorCliente} vacioLabel="Ningún cliente tiene saldo pendiente." />

      <h2>Debo (proveedores)</h2>
      <SaldosTable
        saldos={saldosPorProveedor}
        vacioLabel="No hay deudas pendientes con proveedores."
      />

      <h2>Stock disponible</h2>
      {productos.length === 0 ? (
        <p>Todavía no hay productos.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function agruparSaldos(
  pedidos: PedidoParaSaldo[],
  nombreDe: (p: PedidoParaSaldo) => string | undefined,
): { nombre: string; saldo: number }[] {
  const totales = new Map<string, number>()
  for (const pedido of pedidos) {
    const nombre = nombreDe(pedido) ?? '—'
    const saldo = saldoUsd(
      { monto: pedido.monto_total, moneda: pedido.moneda, tasa_bs_por_usd: pedido.tasa_bs_por_usd },
      pedido.abonos,
    )
    totales.set(nombre, (totales.get(nombre) ?? 0) + saldo)
  }
  return Array.from(totales.entries())
    .map(([nombre, saldo]) => ({ nombre, saldo }))
    .filter(({ saldo }) => saldo > EPSILON)
    .sort((a, b) => b.saldo - a.saldo)
}

function SaldosTable({
  saldos,
  vacioLabel,
}: {
  saldos: { nombre: string; saldo: number }[]
  vacioLabel: string
}) {
  if (saldos.length === 0) return <p>{vacioLabel}</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Saldo (USD)</th>
        </tr>
      </thead>
      <tbody>
        {saldos.map(({ nombre, saldo }) => (
          <tr key={nombre}>
            <td>{nombre}</td>
            <td>{saldo.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
