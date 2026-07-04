// Única fuente de la regla de conversión dual moneda (F-04, RF-008).
// Normalización: USD, usando la tasa registrada en la propia transacción.
import type { Moneda } from '../types/entities'

export interface MontoConTasa {
  monto: number
  moneda: Moneda
  tasa_bs_por_usd: number
}

export function aUsd({ monto, moneda, tasa_bs_por_usd }: MontoConTasa): number {
  return moneda === 'USD' ? monto : monto / tasa_bs_por_usd
}

export function aBs({ monto, moneda, tasa_bs_por_usd }: MontoConTasa): number {
  return moneda === 'BS' ? monto : monto * tasa_bs_por_usd
}

/** Saldo en USD de un pedido: monto original menos abonos, cada uno con su propia tasa. */
export function saldoUsd(pedido: MontoConTasa, abonos: MontoConTasa[]): number {
  return aUsd(pedido) - abonos.reduce((sum, abono) => sum + aUsd(abono), 0)
}
