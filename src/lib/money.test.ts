import { describe, expect, it } from 'vitest'
import { aBs, aUsd, saldoUsd } from './money'

describe('aUsd', () => {
  it('devuelve el monto tal cual si ya está en USD', () => {
    expect(aUsd({ monto: 100, moneda: 'USD', tasa_bs_por_usd: 40 })).toBe(100)
  })

  it('convierte Bs a USD con la tasa de la transacción', () => {
    expect(aUsd({ monto: 400, moneda: 'BS', tasa_bs_por_usd: 40 })).toBe(10)
  })
})

describe('aBs', () => {
  it('devuelve el monto tal cual si ya está en Bs', () => {
    expect(aBs({ monto: 400, moneda: 'BS', tasa_bs_por_usd: 40 })).toBe(400)
  })

  it('convierte USD a Bs con la tasa de la transacción', () => {
    expect(aBs({ monto: 10, moneda: 'USD', tasa_bs_por_usd: 40 })).toBe(400)
  })
})

describe('saldoUsd', () => {
  const pedidoUsd = { monto: 100, moneda: 'USD', tasa_bs_por_usd: 40 } as const

  it('sin abonos, el saldo es el monto completo', () => {
    expect(saldoUsd(pedidoUsd, [])).toBe(100)
  })

  it('resta abonos en la misma moneda', () => {
    const abonos = [
      { monto: 30, moneda: 'USD', tasa_bs_por_usd: 40 } as const,
      { monto: 20, moneda: 'USD', tasa_bs_por_usd: 42 } as const,
    ]
    expect(saldoUsd(pedidoUsd, [...abonos])).toBe(50)
  })

  it('cada abono en Bs usa su propia tasa, no la del pedido', () => {
    // Pedido a tasa 40; abono de 500 Bs cuando la tasa era 50 → 10 USD.
    const abonos = [{ monto: 500, moneda: 'BS', tasa_bs_por_usd: 50 } as const]
    expect(saldoUsd(pedidoUsd, [...abonos])).toBe(90)
  })

  it('mezcla de monedas en pedido y abonos', () => {
    // Pedido de 4000 Bs a tasa 40 → 100 USD.
    const pedidoBs = { monto: 4000, moneda: 'BS', tasa_bs_por_usd: 40 } as const
    const abonos = [
      { monto: 25, moneda: 'USD', tasa_bs_por_usd: 40 } as const,
      { monto: 1000, moneda: 'BS', tasa_bs_por_usd: 50 } as const, // 20 USD
    ]
    expect(saldoUsd(pedidoBs, [...abonos])).toBe(55)
  })

  it('queda en cero al abonar el total', () => {
    const abonos = [{ monto: 100, moneda: 'USD', tasa_bs_por_usd: 40 } as const]
    expect(saldoUsd(pedidoUsd, [...abonos])).toBe(0)
  })
})
