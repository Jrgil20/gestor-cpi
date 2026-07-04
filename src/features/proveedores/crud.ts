import { createSimpleEntityCrud } from '../shared/entityCrud'
import type { Proveedor } from '../../types/entities'

export const proveedoresCrud = createSimpleEntityCrud<Proveedor>('proveedores')
