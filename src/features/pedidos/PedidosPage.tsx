// F-02 — Pedidos de compra y venta (RF-004, RF-005).
import { useState } from 'react'
import { NuevoPedidoCompraForm } from './NuevoPedidoCompraForm'
import { NuevoPedidoVentaForm } from './NuevoPedidoVentaForm'
import { PedidosList } from './PedidosList'

type Tab = 'compra' | 'venta'

export default function PedidosPage() {
  const [tab, setTab] = useState<Tab>('compra')

  return (
    <section>
      <h1>Pedidos</h1>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'compra' ? 'tab-active' : ''}
          onClick={() => setTab('compra')}
        >
          Nueva compra
        </button>
        <button
          type="button"
          className={tab === 'venta' ? 'tab-active' : ''}
          onClick={() => setTab('venta')}
        >
          Nueva venta
        </button>
      </div>

      {tab === 'compra' ? <NuevoPedidoCompraForm /> : <NuevoPedidoVentaForm />}

      <h2>Historial</h2>
      <PedidosList />
    </section>
  )
}
