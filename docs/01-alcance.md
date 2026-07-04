# 01 — Alcance

## In-scope (MVP)

1. Registro de proveedores, clientes y productos.
2. Pedidos de compra (a proveedor) y pedidos de venta (a cliente), con detalle de productos.
3. Cuentas por pagar y cuentas por cobrar derivadas automáticamente de los pedidos.
4. Abonos parciales sobre cada deuda/cobro, con saldo restante calculado automáticamente.
5. Dual moneda USD + Bs, con tasa de cambio registrada manualmente por transacción.
6. Inventario básico: el stock entra con las compras y sale con las ventas.
7. Dashboard principal: saldos por cliente, saldos por proveedor y stock disponible.
8. Multi-dispositivo: nube transaccional + respaldo local con sincronización al iniciar la app.

## Out-of-scope (explícito, esta versión)

| Exclusión | Motivo |
|---|---|
| Facturación fiscal / cumplimiento tributario | Fuera del propósito del MVP: la app es una herramienta de control interno, no de emisión fiscal. |
| Notificaciones o mensajería hacia clientes (recordatorios externos) | Decisión explícita: basta con que los pendientes por cobrar sean visibles en la app en una vista ordenable. |
| Catálogo público o e-commerce | La app es de uso interno del comerciante; no hay canal de venta público en esta versión. |
| Reportes contables avanzados (estados financieros, libro mayor) | Excede la profundidad de registro acordada (pedidos + inventario básico). |
| Multi-almacén o trazabilidad de lotes | El stock es una cantidad simple por producto (supuesto 2); no hay múltiples ubicaciones ni lotes. |

## Ideas futuras (no comprometidas)

- **Multi-usuario con roles o cuentas separadas** (F-08, Should): incorporar 2-3 personas de confianza con separación por roles o por cuentas cuando sea necesario.
- **Vistas secundarias** (F-09, Should): historial, pedidos pendientes y pendientes por cobrar ordenables, como complemento del dashboard principal.
