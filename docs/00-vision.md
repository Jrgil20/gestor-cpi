# 00 — Visión

## Problema

Un comerciante de un pequeño comercio compra productos a múltiples proveedores (incluso el mismo producto a distintos proveedores) y vende a clientes mediante pedidos/encargos. Hoy no existe un control centralizado de:

- **Cuánto debe** a cada proveedor (cuentas por pagar).
- **Cuánto le deben** sus clientes (cuentas por cobrar).
- **Cuánto stock** tiene disponible de cada producto.

La operación se complica además por el manejo simultáneo de dos monedas (USD y Bs) con tasa de cambio variable, y por pagos y cobros que se realizan en abonos parciales.

## Propuesta de valor

**Gestor-cpi** es una aplicación deliberadamente sencilla que centraliza pedidos, deudas, cobros e inventario básico, de modo que el comerciante sepa en todo momento —y desde cualquiera de sus dispositivos— cuánto debe, cuánto le deben y qué stock tiene.

## Objetivos

1. Registrar proveedores, clientes y productos en un solo lugar.
2. Derivar automáticamente las cuentas por pagar y por cobrar a partir de los pedidos de compra y de venta.
3. Soportar abonos parciales con cálculo automático del saldo restante.
4. Manejar dual moneda USD + Bs con tasa de cambio ingresada manualmente por transacción.
5. Mantener un inventario básico: el stock entra con las compras y sale con las ventas.
6. Ofrecer un dashboard principal con los saldos por cliente, por proveedor y el stock disponible.
7. Permitir el uso multi-dispositivo mediante nube transaccional + respaldo local sincronizado al iniciar la app.

## Actores

| Actor | Descripción |
|---|---|
| **Comerciante (usuario inicial)** | Una sola persona que opera la app desde varios dispositivos. Registra entidades, pedidos, abonos y consulta saldos y stock. |
| **Usuarios adicionales (previstos)** | 2-3 personas de confianza que se incorporarán más adelante, con separación por roles o por cuentas cuando sea necesario (fuera del corte Must del MVP). |

## Criterios de éxito

- **Criterio principal del MVP:** en menos de 30 segundos, el usuario puede saber cuánto le debe cualquier cliente y cuánto le debe él a cualquier proveedor.
- El dashboard principal muestra siempre los tres indicadores clave: cuánto me deben (por cliente), cuánto debo (por proveedor) y stock disponible.
- Los pendientes por cobrar son visibles y ordenables dentro de la app, sin necesidad de notificaciones ni mensajería externa.

## Supuestos

1. La tasa de cambio se ingresa manualmente al momento de la transacción, sin API externa (coherente con la restricción de mínima dependencia de servicios externos).
2. El stock es una cantidad simple por producto, sin variantes (tallas, colores) ni unidades de medida complejas.
3. Un pedido de venta puede quedar "pendiente de entrega" (encargo) antes de descontar stock.
4. No se requiere funcionamiento 100 % offline: el almacenamiento local es respaldo, no modo primario de trabajo.
5. Criterio de éxito del MVP: en menos de 30 segundos el usuario puede saber cuánto le debe cualquier cliente y cuánto le debe él a cualquier proveedor.
6. *(Derivado)* El uso multi-dispositivo con nube implica alguna forma de acceso autenticado por cuenta; el mecanismo concreto se decidirá en la fase de diseño.
