# 06 — Arquitectura

Fase de diseño técnico del MVP. Decisiones ya tomadas por el usuario: stack sugerido confirmado (TypeScript, React + Vite, Supabase, IndexedDB/Dexie; Capacitor pospuesto), enfoque **web primero**, entregable de esta fase: diseño + scaffolding sin features.

## Visión general

```
┌─────────────────────────────┐        ┌──────────────────────┐
│  SPA React + TypeScript     │  HTTPS │  Supabase            │
│  (web; luego Capacitor)     │◄──────►│  · Postgres (datos)  │
│                             │        │  · Auth (RNF-006)    │
│  ┌───────────────────────┐  │        └──────────────────────┘
│  │ IndexedDB (Dexie)     │  │
│  │ respaldo local (F-07) │  │   Sin backend propio: el frontend
│  └───────────────────────┘  │   habla directo con Supabase.
└─────────────────────────────┘
```

- **Escrituras:** siempre contra Supabase (no hay escritura offline, supuesto 4).
- **Lecturas:** desde Supabase vía React Query; si no hay conexión, lectura desde el respaldo local (solo lectura).
- **Sincronización (RF-012):** al iniciar la app se descargan las tablas del negocio y se vuelcan en IndexedDB.

## Modelo de datos

Cinco tablas. Las cuentas por pagar/cobrar (RF-006) **no son una tabla**: se derivan del pedido y sus abonos (`saldo = monto_total − Σ abonos`), lo que elimina una fuente de inconsistencia.

| Tabla | Propósito | Campos clave |
|---|---|---|
| `proveedores` | Entidad F-01 | `id`, `nombre`, `contacto`, `activo` |
| `clientes` | Entidad F-01 | `id`, `nombre`, `contacto`, `activo` |
| `productos` | Entidad F-01 + stock (F-05) | `id`, `nombre`, `activo`, `stock` |
| `pedidos` | Compras y ventas (F-02) | `id`, `tipo` (`compra`\|`venta`), `proveedor_id`/`cliente_id`, `estado`, `moneda`, `tasa_bs_por_usd`, `monto_total`, `fecha` |
| `pedido_items` | Detalle de productos por pedido | `pedido_id`, `producto_id`, `cantidad`, `precio_unitario` |
| `abonos` | Pagos/cobros parciales (F-03) | `pedido_id`, `monto`, `moneda`, `tasa_bs_por_usd`, `fecha` |

Decisiones del modelo:

- **Un solo `pedidos` para compra y venta**, con `tipo` y un `CHECK` que exige exactamente una contraparte (proveedor o cliente). Evita duplicar la lógica de items y abonos.
- **Estados de pedido:** compra → `registrado`; venta → `pendiente_entrega` | `entregado` (supuesto 3). `anulado` disponible para ambos.
- **Stock como columna en `productos`** (cantidad simple, supuesto 2), actualizado por la capa de servicios en la misma operación que registra la compra o marca la entrega (RF-009). Endurecerlo con triggers de Postgres queda como mejora posterior si aparecen inconsistencias.
- **Historial (F-09):** los propios `pedidos` y `abonos` son el historial; no se necesita tabla adicional.

El DDL ejecutable está en [`supabase/schema.sql`](../supabase/schema.sql).

## Dual moneda (F-04)

- Cada transacción (`pedidos` y `abonos`) guarda **su** `moneda` (`USD`|`BS`) y **su** `tasa_bs_por_usd` ingresada manualmente (RF-008, supuesto 1).
- **Moneda de normalización: USD.** Para todo cálculo agregado, cada monto se convierte con la tasa registrada en su propia transacción: `monto_usd = moneda = 'USD' ? monto : monto / tasa_bs_por_usd`.
- El saldo de un pedido se calcula en USD normalizado, aunque el pedido esté en Bs y los abonos mezclen monedas. La vista puede mostrar el equivalente en Bs con la tasa de la transacción o la última tasa usada.

## Sincronización nube + respaldo local (F-07)

Flujo al iniciar la app (RF-012):

1. Autenticación con Supabase Auth (sesión persistida).
2. *Pull* completo de las 5 tablas (volumen de pequeño comercio, RNF-002: centenares de registros — un pull completo es trivial y elimina toda lógica de deltas).
3. Volcado en IndexedDB vía Dexie (reemplazo por tabla, transaccional).
4. La app opera contra Supabase; React Query cachea en memoria. Si una lectura falla por red, se sirve desde Dexie con un indicador de "datos de respaldo".

No hay cola de escrituras offline ni resolución de conflictos: fuera de alcance por el supuesto 4.

## Autenticación y acceso (RNF-006)

- **Supabase Auth** con email/contraseña; un solo usuario en el MVP.
- **RLS activado** en todas las tablas con política "solo usuarios autenticados". Cuando llegue F-08 (multi-usuario con roles), se amplía con una tabla de perfiles/roles y políticas por rol — sin migración estructural del modelo.

## Estructura de la aplicación

```
src/
  lib/
    supabase.ts        # cliente Supabase (env: VITE_SUPABASE_URL/ANON_KEY)
    localdb.ts         # Dexie: espejo local de las 5 tablas
    money.ts           # normalización USD/Bs (única fuente de la regla de conversión)
  types/
    entities.ts        # tipos de las entidades del modelo
  features/            # una carpeta por feature (F-XX), con sus vistas y servicios
    dashboard/         # F-06 (ruta raíz)
    proveedores/       # F-01
    clientes/          # F-01
    productos/         # F-01 + stock (F-05)
    pedidos/           # F-02 (+ movimientos de stock RF-009)
    abonos/            # F-03
  app/
    router.tsx         # rutas (React Router)
    App.tsx            # layout + providers (React Query)
```

Reglas:

- La lógica de negocio (generar CxP/CxC, calcular saldos, mover stock) vive en los **servicios de cada feature**, nunca en componentes.
- `money.ts` es el único lugar donde existe la fórmula de conversión.

## Roadmap de iteraciones

| It. | Entrega | Features | Estado |
|---|---|---|---|
| 0 | Scaffolding + esquema Supabase + login | (esta fase) | ✅ Hecha (login se completó junto con F-09) |
| 1 | CRUD proveedores, clientes, productos | F-01 | ✅ Hecha |
| 2 | Pedidos de compra/venta + movimientos de stock | F-02, F-05 | ✅ Hecha |
| 3 | Abonos y saldos con dual moneda | F-03, F-04 | ✅ Hecha |
| 4 | Dashboard principal | F-06 | ✅ Hecha |
| 5 | Respaldo local + sincronización al iniciar | F-07 | ✅ Hecha (pull al iniciar; el fallback de lectura por pantalla quedó fuera, ver nota) |
| post-MVP | Vistas secundarias | F-09 | ✅ Hecha |
| post-MVP | Multi-usuario con roles/cuentas | F-08 | ⏳ Diferido hasta backend real; modelo decidido: roles `admin`/`operador` (perfiles + RLS por rol) |
| post-MVP | App instalable | — | ✅ PWA mínima (manifest); Capacitor descartado por ahora |

Cada iteración termina usable y desplegada; el criterio de éxito del MVP (RNF-001) se valida al cierre de la iteración 4.

**Notas de implementación:**

- Toda la funcionalidad está verificada con typecheck, build, lint y pruebas de humo en navegador contra un backend inalcanzable (manejo de errores). La validación de extremo a extremo con datos reales queda pendiente de configurar el proyecto Supabase (ver `.env.example`).
- El fallback de lectura offline por pantalla (servir desde IndexedDB cuando una lectura en vivo falla) no se construyó: el supuesto 4 dice que no se requiere modo offline, y reconstruir las relaciones desde Dexie es complejidad real para un caso hipotético. Se reevalúa con uso real.
- La regla de conversión dual moneda (`src/lib/money.ts`) tiene pruebas unitarias (`npm test`).

## Qué queda fuera de este documento

Contratos de consultas específicas, diseño visual de pantallas y configuración de Capacitor: se resuelven dentro de cada iteración.
