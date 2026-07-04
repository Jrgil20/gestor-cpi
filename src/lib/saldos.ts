// Agregación de saldos por contraparte (RF-011). Lógica pura para poder
// probarla sin Supabase; el dashboard le pasa los pedidos ya filtrados.
import { saldoUsd, type MontoConTasa } from './money'

export const SALDO_EPSILON = 0.005

export interface PedidoParaSaldo {
  monto_total: number
  moneda: MontoConTasa['moneda']
  tasa_bs_por_usd: number
  abonos: MontoConTasa[]
}

export interface SaldoAgrupado {
  nombre: string
  /** USD normalizado; negativo = la contraparte tiene saldo a favor (crédito). */
  saldo: number
}

export function agruparSaldos<T extends PedidoParaSaldo>(
  pedidos: T[],
  nombreDe: (pedido: T) => string | undefined,
): SaldoAgrupado[] {
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
    .filter(({ saldo }) => Math.abs(saldo) > SALDO_EPSILON)
    .sort((a, b) => b.saldo - a.saldo)
}
