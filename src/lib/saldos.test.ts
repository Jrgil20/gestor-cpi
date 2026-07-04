import { describe, expect, it } from 'vitest'
import { agruparSaldos, type PedidoParaSaldo } from './saldos'

type PedidoDePrueba = PedidoParaSaldo & { nombre?: string }

function pedido(
  nombre: string | undefined,
  monto: number,
  moneda: 'USD' | 'BS' = 'USD',
  tasa = 40,
  abonos: PedidoParaSaldo['abonos'] = [],
): PedidoDePrueba {
  return { nombre, monto_total: monto, moneda, tasa_bs_por_usd: tasa, abonos }
}

const porNombre = (p: PedidoDePrueba) => p.nombre

describe('agruparSaldos', () => {
  it('suma los saldos de varios pedidos de la misma contraparte', () => {
    const resultado = agruparSaldos([pedido('Ana', 100), pedido('Ana', 50)], porNombre)
    expect(resultado).toEqual([{ nombre: 'Ana', saldo: 150 }])
  })

  it('separa contrapartes y ordena de mayor a menor saldo', () => {
    const resultado = agruparSaldos([pedido('Ana', 30), pedido('Luis', 200)], porNombre)
    expect(resultado.map((s) => s.nombre)).toEqual(['Luis', 'Ana'])
  })

  it('descuenta los abonos con la tasa propia de cada abono', () => {
    // Pedido de 4000 Bs a tasa 40 (= 100 USD), abono de 1000 Bs a tasa 50 (= 20 USD).
    const conAbono = pedido('Ana', 4000, 'BS', 40, [
      { monto: 1000, moneda: 'BS', tasa_bs_por_usd: 50 },
    ])
    expect(agruparSaldos([conAbono], porNombre)).toEqual([{ nombre: 'Ana', saldo: 80 }])
  })

  it('excluye contrapartes saldadas', () => {
    const saldado = pedido('Ana', 100, 'USD', 40, [
      { monto: 100, moneda: 'USD', tasa_bs_por_usd: 40 },
    ])
    expect(agruparSaldos([saldado], porNombre)).toEqual([])
  })

  it('conserva saldos negativos (créditos a favor)', () => {
    const sobrepagado = pedido('Ana', 100, 'USD', 40, [
      { monto: 130, moneda: 'USD', tasa_bs_por_usd: 40 },
    ])
    expect(agruparSaldos([sobrepagado], porNombre)).toEqual([{ nombre: 'Ana', saldo: -30 }])
  })

  it('un crédito compensa deuda de la misma contraparte', () => {
    const deuda = pedido('Ana', 100)
    const credito = pedido('Ana', 50, 'USD', 40, [
      { monto: 80, moneda: 'USD', tasa_bs_por_usd: 40 },
    ])
    expect(agruparSaldos([deuda, credito], porNombre)).toEqual([{ nombre: 'Ana', saldo: 70 }])
  })

  it('usa un guion para contrapartes sin nombre', () => {
    expect(agruparSaldos([pedido(undefined, 10)], porNombre)).toEqual([
      { nombre: '—', saldo: 10 },
    ])
  })
})
