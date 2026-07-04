# 04 — Features

Convenciones: IDs `F-XX`; prioridad MoSCoW acordada con el usuario; cada feature lista sus RF y cada RF pertenece a exactamente una feature (trazabilidad bidireccional con [02-requisitos-funcionales.md](02-requisitos-funcionales.md)).

---

## F-01 — Gestión de entidades (proveedores, clientes, productos)

- **Prioridad:** Must
- **Descripción:** Registro y mantenimiento de las tres entidades base del negocio: proveedores a los que se compra, clientes a los que se vende y productos que se comercian (incluso el mismo producto comprado a distintos proveedores).
- **Requisitos:** RF-001, RF-002, RF-003

## F-02 — Pedidos de compra y venta

- **Prioridad:** Must
- **Descripción:** Registro de pedidos de compra (a proveedor) y pedidos de venta/encargos (a cliente), con detalle de productos y cantidades. Los pedidos de venta pueden quedar pendientes de entrega.
- **Requisitos:** RF-004, RF-005

## F-03 — CxP / CxC con abonos parciales

- **Prioridad:** Must
- **Descripción:** Cuentas por pagar y por cobrar derivadas automáticamente de los pedidos, con abonos parciales y saldo restante calculado automáticamente.
- **Requisitos:** RF-006, RF-007

## F-04 — Dual moneda USD/Bs con tasa manual

- **Prioridad:** Must
- **Descripción:** Registro de montos en USD y Bs con tasa de cambio ingresada manualmente por transacción, sin dependencia de APIs externas.
- **Requisitos:** RF-008

## F-05 — Inventario básico

- **Prioridad:** Must
- **Descripción:** Control de stock simple por producto: entra con las compras, sale con las entregas de ventas, y es consultable en todo momento.
- **Requisitos:** RF-009, RF-010

## F-06 — Dashboard principal

- **Prioridad:** Must
- **Descripción:** Vista principal de la app con los tres indicadores clave: cuánto me deben (por cliente), cuánto debo (por proveedor) y stock disponible.
- **Requisitos:** RF-011

## F-07 — Sincronización nube + respaldo local

- **Prioridad:** Must
- **Descripción:** Persistencia transaccional en la nube con respaldo local que se sincroniza al iniciar la app, habilitando el uso multi-dispositivo.
- **Requisitos:** RF-012

## F-08 — Multi-usuario con roles/cuentas separadas

- **Prioridad:** Should
- **Descripción:** Incorporación de 2-3 personas de confianza con separación por roles o por cuentas cuando sea necesario.
- **Requisitos:** RF-013

## F-09 — Vistas secundarias

- **Prioridad:** Should
- **Descripción:** Vistas complementarias al dashboard: historial de transacciones, pedidos pendientes y pendientes por cobrar ordenables (sin notificaciones ni mensajería externa).
- **Requisitos:** RF-014

---

## Corte del MVP

El MVP lo constituyen las features **Must**: F-01, F-02, F-03, F-04, F-05, F-06 y F-07 (RF-001 a RF-012). Las features **Should** (F-08, F-09) se abordan después de validar el MVP con uso real.

## Verificación de trazabilidad

| Feature | Prioridad | RFs | Nº RF |
|---|---|---|---|
| F-01 | Must | RF-001, RF-002, RF-003 | 3 |
| F-02 | Must | RF-004, RF-005 | 2 |
| F-03 | Must | RF-006, RF-007 | 2 |
| F-04 | Must | RF-008 | 1 |
| F-05 | Must | RF-009, RF-010 | 2 |
| F-06 | Must | RF-011 | 1 |
| F-07 | Must | RF-012 | 1 |
| F-08 | Should | RF-013 | 1 |
| F-09 | Should | RF-014 | 1 |

- ✅ 14 RF en total (RF-001…RF-014), cada uno asignado a exactamente una feature — **ningún RF huérfano**.
- ✅ 9 features (F-01…F-09), todas con al menos un RF — **ninguna feature vacía**.
