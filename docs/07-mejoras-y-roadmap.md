# 07 — Revisión de la app y plan de mejoras

Resultado de una revisión a fondo del código tras completar el MVP (F-01…F-07, F-09, RNF-006). Cada hallazgo indica severidad, esfuerzo estimado y por qué importa. El estado global es sólido para un MVP — build, lint y pruebas en verde, errores de red manejados — pero hay bugs reales de baja visibilidad y vacíos funcionales que conviene atender antes de uso diario.

> **Estado de ejecución:** todos los puntos P1, P2 y P3.1/P3.2 fueron ejecutados (el usuario delegó las decisiones; quedaron registradas en la sección final). Pendiente únicamente lo que requiere cuentas del usuario: P3.3 (proyecto Supabase) y P3.4 (hosting). Ver "Decisiones tomadas y estado final".

## P1 — Correcciones (bugs reales)

### 1.1 La fecha se registra en UTC, no en hora local ⚠️ el más urgente

`hoy()` en los tres formularios usa `new Date().toISOString().slice(0, 10)`, que devuelve la fecha **UTC**. En Venezuela (UTC−4), cualquier pedido o abono registrado después de las 8:00 p. m. queda fechado **al día siguiente**. Para un comercio que registra ventas por la noche, esto corrompe silenciosamente el historial.

- **Dónde:** `NuevoPedidoCompraForm.tsx`, `NuevoPedidoVentaForm.tsx`, `AbonoForm.tsx`
- **Arreglo:** helper único `hoyLocal()` en `src/lib/` que formatee la fecha local. Esfuerzo: minutos.

### 1.2 Operaciones multi-paso sin transacción

`crearPedidoCompra` hace 3+ llamadas separadas (insertar pedido → insertar items → ajustar stock por producto). Si falla a mitad de camino quedan datos inconsistentes: pedidos sin items, o stock sin ajustar. `marcarVentaEntregada` es peor: descuenta stock **antes** de cambiar el estado; si el cambio de estado falla y el usuario reintenta, el stock se descuenta **dos veces**.

- **Dónde:** `src/features/pedidos/api.ts`
- **Arreglo:** mover cada operación completa a una función de Postgres (RPC) que corra en una sola transacción, como ya se hizo con `adjust_stock`. Esfuerzo: medio; es el cambio estructural más valioso.

### 1.3 Anulación de pedidos: definida pero inalcanzable

El estado `anulado` existe en el esquema, en los tipos y hasta tiene badge en la UI — pero **no hay ningún botón para anular**. Un pedido registrado por error es permanente. La anulación además debe revertir el stock (compra registrada o venta entregada), lo que refuerza la necesidad del punto 1.2.

- **Arreglo:** acción "Anular" en el historial + RPC transaccional que revierta stock. Esfuerzo: medio.

### 1.4 Sobreabono permitido

`AbonoForm` no valida contra el saldo restante: se puede abonar 500 a una deuda de 100 y el pedido aparece "Saldado" con saldo negativo oculto. Combinado con la tasa por defecto `1` (punto 2.1), un descuido en Bs produce montos absurdos sin aviso.

- **Arreglo:** validar `monto (normalizado) ≤ saldo + ε` en el formulario. Esfuerzo: bajo.

### 1.5 Stock puede quedar negativo sin aviso

Vender/entregar más unidades de las disponibles deja stock negativo silenciosamente. Puede ser legítimo (venta de algo aún no recibido), así que la propuesta es **avisar sin bloquear**: confirmación cuando la entrega dejaría stock < 0.

- **Arreglo:** aviso en el formulario de venta y en "Marcar entregado". Esfuerzo: bajo.

## P2 — Robustez y UX

| # | Mejora | Detalle | Esfuerzo |
|---|---|---|---|
| 2.1 | Recordar la última tasa de cambio | Hoy cada formulario arranca con tasa `1`. Guardar la última usada (localStorage) y precargarla reduce el error de datos más probable de toda la app. | Bajo |
| 2.2 | Corrección de errores de captura | No se puede editar ni eliminar un pedido o abono registrado. Mínimo viable: eliminar abonos; la corrección de pedidos puede cubrirse con anular + recrear (1.3). | Medio |
| 2.3 | Créditos invisibles | El dashboard filtra saldos ≤ 0: un cliente que pagó de más (saldo a favor) desaparece en lugar de mostrarse como crédito. | Bajo |
| 2.4 | Mensajes de error crudos | "Failed to fetch" y errores de Postgres se muestran tal cual. Un mapa de errores comunes → mensajes en español mejoraría mucho la experiencia. | Bajo |
| 2.5 | Respaldo local sin uso visible | El espejo IndexedDB se escribe al iniciar pero nunca se lee. Decidir: implementar el indicador "mostrando datos de respaldo" al fallar la red, o retirar el espejo hasta que haga falta. Mantener código muerto es el peor de los tres caminos. | Medio / decisión |
| 2.6 | Bundle único de 636 kB | Vite lo advierte en cada build. Lazy-load de rutas lo resuelve; con volumen de datos pequeño no es urgente. | Bajo |

## P3 — Calidad e infraestructura

1. **CI en GitHub Actions**: `lint + test + build` en cada push. El repo ya tiene los tres comandos; solo falta el workflow. Esfuerzo: bajo, valor alto.
2. **Más pruebas unitarias**: `agruparSaldos` del dashboard (agregación por contraparte con monedas mezcladas) es lógica pura y testeable; hoy solo `money.ts` tiene cobertura.
3. **Validación end-to-end** ⚠️ bloqueada por el usuario: crear el proyecto Supabase real, aplicar `schema.sql`, crear el usuario y probar el flujo completo. Nada de lo anterior sustituye esto.
4. **Despliegue**: hosting estático (Vercel/Netlify/Cloudflare Pages) + variables de entorno. Requiere cuenta del usuario.

## Próximas features (requieren decisión de producto)

| Feature | Qué hay que decidir | Notas |
|---|---|---|
| **F-08 Multi-usuario** | ¿Qué roles existen y qué puede hacer cada uno? Opciones típicas: (a) admin + solo-lectura, (b) admin + operador sin anulaciones, (c) cuentas 100 % separadas por negocio | El esquema RLS actual ("authenticated full access") se amplía sin migración estructural |
| **Abonos por contraparte** | Hoy los abonos son por pedido; si un cliente paga un monto global que cubre varias deudas, el usuario debe repartirlo a mano. ¿Se reparte automático (más antiguo primero)? | Cambio de modelo de datos: el abono pasaría a referenciar al cliente/proveedor |
| **Capacitor / PWA** | ¿Hace falta app instalable, o basta el navegador del teléfono? PWA (manifest + ícono) es 90 % del beneficio con 10 % del esfuerzo | Pospuesto por decisión "web primero" |
| **Búsqueda y filtros** | Cuando las listas crezcan (¿+50 registros?), buscar por nombre y filtrar el historial por fecha/contraparte | Sin urgencia hasta tener datos reales |

## Orden de ejecución sugerido

```
1. Fecha local (1.1)                      ← minutos, evita corrupción de datos
2. Validar sobreabono (1.4) + tasa recordada (2.1)
3. RPCs transaccionales (1.2) y sobre ellas la anulación (1.3)
4. Aviso de stock negativo (1.5) + créditos visibles (2.3)
5. CI (P3.1) + pruebas de agruparSaldos (P3.2)
   ── a partir de aquí conviene el backend real ──
6. Validación e2e + despliegue (P3.3, P3.4)
7. Features nuevas según decisiones de producto
```

Los pasos 1-5 son ejecutables de inmediato sin decisiones pendientes; el 6 necesita las credenciales de Supabase y una cuenta de hosting; el 7 necesita las definiciones de la tabla anterior.

---

## Decisiones tomadas y estado final

El usuario delegó las decisiones de producto. Lo decidido y ejecutado:

| Punto | Decisión | Estado |
|---|---|---|
| 1.1 Fecha UTC | `hoyLocal()` en `src/lib/fecha.ts` | ✅ Hecho |
| 1.2 Transaccionalidad | RPCs plpgsql en `supabase/schema.sql` (`crear_pedido_compra/venta`, `marcar_venta_entregada` con guard de idempotencia, `anular_pedido`); `adjust_stock` eliminada | ✅ Hecho |
| 1.3 Anulación | Botón "Anular" con confirmación; revierte stock; bloqueada si hay abonos (se eliminan primero) | ✅ Hecho |
| 1.4 Sobreabono | Validado contra el saldo normalizado en `AbonoForm` | ✅ Hecho |
| 1.5 Stock negativo | Aviso con confirmación, sin bloquear (vender por adelantado es legítimo) | ✅ Hecho |
| 2.1 Última tasa | Recordada en localStorage (`src/lib/tasa.ts`) | ✅ Hecho |
| 2.2 Corrección de capturas | Eliminar abonos + anular pedidos; **sin** edición de pedidos (anular + recrear la cubre) | ✅ Hecho |
| 2.3 Créditos | Visibles como badge "A favor" en el dashboard; `agruparSaldos` extraída a `src/lib/saldos.ts` | ✅ Hecho |
| 2.4 Errores | `mensajeDeError()` en `src/lib/errores.ts`, aplicado en toda la UI (incluye manejo de PostgrestError, que no es `instanceof Error`) | ✅ Hecho |
| 2.5 Respaldo local | **Mantener el espejo sin fallback de lectura** (supuesto 4: no hay modo offline); se añadió indicador de última sincronización en la navegación | ✅ Hecho |
| 2.6 Bundle | Rutas lazy + vendors en chunks propios; sin aviso de build | ✅ Hecho |
| P3.1 CI | `.github/workflows/ci.yml`: lint + test + build en cada push/PR a main | ✅ Hecho |
| P3.2 Pruebas | 16 pruebas (money + saldos, incluye créditos y monedas mezcladas) | ✅ Hecho |
| PWA vs Capacitor | **PWA mínima** (manifest + theme-color); sin service worker porque no hay modo offline | ✅ Hecho |
| F-08 Multi-usuario | **Diferido** hasta backend real y necesidad concreta; modelo decidido: roles `admin`/`operador` con tabla de perfiles + políticas RLS por rol | ⏳ Diferido |
| Abonos por contraparte | **No** en esta versión: cambia el modelo de datos; se reevalúa con uso real | ⏳ Diferido |
| Búsqueda/filtros | Diferido hasta tener volumen real de datos | ⏳ Diferido |

**Pendiente del usuario (único bloqueo):**

1. Crear el proyecto en supabase.com, aplicar `supabase/schema.sql`, crear su usuario (Authentication → Users) y completar `.env` → habilita la validación end-to-end (P3.3).
2. Cuenta de hosting estático para el despliegue (P3.4).
