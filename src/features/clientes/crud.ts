import { createSimpleEntityCrud } from '../shared/entityCrud'
import type { Cliente } from '../../types/entities'

export const clientesCrud = createSimpleEntityCrud<Cliente>('clientes')
