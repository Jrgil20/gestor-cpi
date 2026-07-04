# 05 — Stack sugerido

> **Este documento es una sugerencia argumentada, no una decisión cerrada.** La decisión final es del usuario y se toma en la fase de diseño. Las restricciones dadas son: base **TypeScript**, **Capacitor como candidato** para móvil, despliegue lo más simple posible y **mínima dependencia de servicios externos** (nube solo para transaccionalidad + respaldo local sincronizado al iniciar).

## Stack recomendado

| Capa | Sugerencia | Justificación |
|---|---|---|
| Lenguaje | **TypeScript** end-to-end | Restricción de plataforma dada por el usuario. Un solo lenguaje reduce fricción para un proyecto de una persona (RNF-005). |
| Frontend | **React + Vite** (SPA) | Ecosistema TypeScript maduro, arranque y build simples. Una sola base de código para todos los dispositivos (RNF-003). |
| Móvil | **Capacitor** envolviendo la misma SPA | Candidato ya identificado por el usuario. Permite empaquetar la app web como app móvil sin duplicar código (RNF-003). |
| Nube transaccional | **Supabase** (Postgres gestionado + autenticación incluida) | Un único servicio externo cubre persistencia transaccional y autenticación (RNF-004, RNF-005, RNF-006). Sin servidor propio que mantener: el frontend habla directo con Supabase, lo que mantiene el despliegue mínimo. |
| Respaldo local | **IndexedDB** en el dispositivo (p. ej. vía Dexie) | Cubre el respaldo local que se sincroniza al iniciar la app (RF-012, RNF-004) sin infraestructura adicional. Al no requerirse offline completo (supuesto 4), basta una copia de lectura refrescada al inicio. |
| Hosting web | Hosting estático (p. ej. Vercel/Netlify/Cloudflare Pages, capa gratuita) | La SPA es estática: el despliegue es un solo comando o push (RNF-005). |

**Conteo de dependencias externas:** un servicio gestionado (Supabase) + un hosting estático. Coherente con la métrica de RNF-005 (a lo sumo un servicio externo *de datos*).

### Por qué encaja con los RNF

- **RNF-001/RNF-002 (saldos en <30 s, dashboard <3 s):** con centenares de registros, una SPA que lee de Supabase (o del respaldo local ya sincronizado) resuelve el dashboard con una consulta simple; no se necesita capa de backend intermedia.
- **RNF-003 (multi-dispositivo):** una sola base React/TypeScript sirve web de escritorio y, vía Capacitor, móvil.
- **RNF-004 (nube + respaldo local):** Supabase da la transaccionalidad; IndexedDB da el respaldo local sincronizado al iniciar.
- **RNF-005 (despliegue simple, mínima dependencia):** sin servidor propio, sin APIs externas de tasas de cambio (supuesto 1); todo el "backend" es un servicio gestionado con capa gratuita.
- **RNF-006 (acceso autenticado):** Supabase Auth + reglas de acceso a nivel de fila cubren el usuario único hoy y la separación por roles/cuentas de F-08 mañana, sin código de backend adicional.

## Alternativa

| Capa | Alternativa | Cuándo preferirla |
|---|---|---|
| Nube + backend | **Backend Node/TypeScript propio mínimo** (p. ej. Fastify/Hono) + **SQLite gestionado (Turso) o Postgres** | Si se quiere control total de la lógica de negocio en servidor (p. ej. validaciones de stock centralizadas) o evitar acoplarse al modelo de un BaaS. Coste: más piezas que desplegar y mantener, en tensión con RNF-005. |
| Frontend | **Svelte/SvelteKit o Vue** | Preferencia personal; mismas propiedades frente a los RNF que React. |
| Móvil | **PWA instalable** en lugar de Capacitor | Si las tiendas de aplicaciones no son necesarias, una PWA elimina el paso de empaquetado; Capacitor sigue disponible como camino si luego se requiere app nativa. |

## Qué NO se decide aquí

El esquema de base de datos, los contratos de API/consultas y el mecanismo detallado de sincronización pertenecen a la **fase de diseño de arquitectura**, posterior a esta documentación fundacional.
