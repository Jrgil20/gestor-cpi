# 02 — Requisitos funcionales

Convenciones: IDs correlativos `RF-XXX`; prioridad MoSCoW (`Must` / `Should` / `Could` / `Won't`); cada RF pertenece a exactamente una feature (ver [04-features.md](04-features.md)).

---

## RF-001 — Gestión de proveedores

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-01
- **Descripción:** El sistema debe permitir crear, editar y desactivar proveedores con sus datos básicos de identificación y contacto.
- **Criterios de aceptación:**
  1. Al crear un proveedor con nombre, este queda disponible para asociarse a pedidos de compra.
  2. Un proveedor desactivado no aparece al crear nuevos pedidos, pero su historial y saldos permanecen consultables.

## RF-002 — Gestión de clientes

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-01
- **Descripción:** El sistema debe permitir crear, editar y desactivar clientes con sus datos básicos de identificación y contacto.
- **Criterios de aceptación:**
  1. Al crear un cliente con nombre, este queda disponible para asociarse a pedidos de venta.
  2. Un cliente desactivado no aparece al crear nuevos pedidos, pero su historial y saldos permanecen consultables.

## RF-003 — Gestión de productos

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-01
- **Descripción:** El sistema debe permitir crear, editar y desactivar productos. Un mismo producto puede comprarse a distintos proveedores. El stock de cada producto es una cantidad simple, sin variantes ni unidades de medida complejas (supuesto 2).
- **Criterios de aceptación:**
  1. Al crear un producto, este queda disponible para incluirse en pedidos de compra y de venta.
  2. Un mismo producto puede aparecer en pedidos de compra de proveedores distintos sin duplicarse en el catálogo.

## RF-004 — Registro de pedidos de compra

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-02
- **Descripción:** El sistema debe permitir registrar pedidos de compra a un proveedor, con detalle de productos y cantidades, y el monto asociado a la transacción.
- **Criterios de aceptación:**
  1. Un pedido de compra registra proveedor, líneas de producto (producto + cantidad) y monto.
  2. Al registrar el pedido de compra se genera la cuenta por pagar correspondiente (ver RF-006).

## RF-005 — Registro de pedidos de venta

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-02
- **Descripción:** El sistema debe permitir registrar pedidos de venta (encargos) a un cliente, con detalle de productos y cantidades, y el monto asociado. Un pedido de venta puede quedar "pendiente de entrega" antes de descontar stock (supuesto 3).
- **Criterios de aceptación:**
  1. Un pedido de venta registra cliente, líneas de producto (producto + cantidad) y monto.
  2. Un pedido de venta puede marcarse como "pendiente de entrega"; en ese estado no descuenta stock.
  3. Al registrar el pedido de venta se genera la cuenta por cobrar correspondiente (ver RF-006).

## RF-006 — Generación de cuentas por pagar y por cobrar

- **Actor:** Sistema
- **Prioridad:** Must
- **Feature:** F-03
- **Descripción:** El sistema debe derivar automáticamente una cuenta por pagar de cada pedido de compra y una cuenta por cobrar de cada pedido de venta, sin registro manual adicional.
- **Criterios de aceptación:**
  1. Dado un pedido de compra registrado, cuando se consulta el proveedor, entonces su saldo por pagar refleja el monto del pedido.
  2. Dado un pedido de venta registrado, cuando se consulta el cliente, entonces su saldo por cobrar refleja el monto del pedido.

## RF-007 — Abonos parciales con saldo calculado

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-03
- **Descripción:** El sistema debe permitir registrar abonos parciales sobre cada cuenta por pagar o por cobrar, calculando automáticamente el saldo restante.
- **Criterios de aceptación:**
  1. Al registrar un abono sobre una deuda/cobro, el saldo restante se recalcula automáticamente (saldo = monto original − suma de abonos).
  2. Una cuenta cuyo saldo llega a cero queda marcada como saldada.
  3. El sistema conserva el historial de abonos de cada cuenta.

## RF-008 — Dual moneda con tasa manual por transacción

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-04
- **Descripción:** El sistema debe permitir registrar montos en USD y Bs, con la tasa de cambio ingresada manualmente al momento de cada transacción (pedido o abono), sin depender de APIs externas (supuesto 1).
- **Criterios de aceptación:**
  1. Cada transacción (pedido o abono) almacena su moneda y la tasa de cambio vigente ingresada por el usuario.
  2. Los montos pueden visualizarse en ambas monedas usando la tasa registrada en cada transacción.

## RF-009 — Movimientos de inventario

- **Actor:** Sistema
- **Prioridad:** Must
- **Feature:** F-05
- **Descripción:** El sistema debe aumentar el stock de un producto al registrar la compra que lo incluye, y descontarlo al entregar la venta que lo incluye.
- **Criterios de aceptación:**
  1. Dado un pedido de compra con N unidades de un producto, cuando se registra, entonces el stock de ese producto aumenta en N.
  2. Dado un pedido de venta con N unidades de un producto, cuando se marca como entregado, entonces el stock de ese producto disminuye en N (los pedidos "pendientes de entrega" no descuentan stock, supuesto 3).

## RF-010 — Consulta de stock disponible

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-05
- **Descripción:** El sistema debe mostrar el stock disponible de cada producto como una cantidad simple.
- **Criterios de aceptación:**
  1. Para cualquier producto, el usuario puede consultar su cantidad disponible actual.

## RF-011 — Dashboard principal

- **Actor:** Comerciante
- **Prioridad:** Must
- **Feature:** F-06
- **Descripción:** El sistema debe ofrecer un dashboard principal que muestre: cuánto me deben (saldos por cliente), cuánto debo (saldos por proveedor) y el stock disponible. Pueden existir otras vistas, pero esta es la principal.
- **Criterios de aceptación:**
  1. El dashboard muestra los saldos pendientes agrupados por cliente y por proveedor, y el stock disponible.
  2. Desde el dashboard, el usuario identifica el saldo de cualquier cliente o proveedor en menos de 30 segundos desde que abre la app (criterio de éxito del MVP, ver RNF-001).

## RF-012 — Sincronización nube + respaldo local

- **Actor:** Sistema
- **Prioridad:** Must
- **Feature:** F-07
- **Descripción:** El sistema debe persistir las transacciones en la nube y mantener un respaldo local de la data que se sincroniza al iniciar la app, habilitando el uso desde varios dispositivos. El almacenamiento local es respaldo, no modo primario de trabajo (supuesto 4).
- **Criterios de aceptación:**
  1. Al iniciar la app, el respaldo local se actualiza con la data de la nube.
  2. Un registro creado desde un dispositivo es visible desde otro dispositivo tras iniciar la app en este último.

## RF-013 — Multi-usuario con roles o cuentas separadas

- **Actor:** Comerciante, usuarios adicionales
- **Prioridad:** Should
- **Feature:** F-08
- **Descripción:** El sistema debe permitir que 2-3 personas de confianza usen la app, con separación por roles o por cuentas cuando sea necesario.
- **Criterios de aceptación:**
  1. Puede darse acceso a un usuario adicional sin compartir la cuenta del usuario principal.
  2. La separación por roles o por cuentas delimita qué ve o hace cada usuario.

## RF-014 — Vistas secundarias

- **Actor:** Comerciante
- **Prioridad:** Should
- **Feature:** F-09
- **Descripción:** El sistema debe ofrecer vistas secundarias complementarias al dashboard: historial de transacciones, pedidos pendientes y pendientes por cobrar en una vista ordenable (sin notificaciones ni mensajería, decisión explícita).
- **Criterios de aceptación:**
  1. La vista de pendientes por cobrar permite ordenar los registros (p. ej. por monto o antigüedad).
  2. El usuario puede consultar el historial de transacciones y los pedidos pendientes.
