// F-01 — Gestión de proveedores (RF-001).
import { SimpleEntityCrudPage } from '../shared/SimpleEntityCrudPage'
import { proveedoresCrud } from './crud'

export default function ProveedoresPage() {
  return <SimpleEntityCrudPage title="Proveedores" crud={proveedoresCrud} />
}
