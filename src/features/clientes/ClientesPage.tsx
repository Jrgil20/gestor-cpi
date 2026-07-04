// F-01 — Gestión de clientes (RF-002).
import { SimpleEntityCrudPage } from '../shared/SimpleEntityCrudPage'
import { clientesCrud } from './crud'

export default function ClientesPage() {
  return <SimpleEntityCrudPage title="Clientes" crud={clientesCrud} />
}
