# Gestor-cpi

Aplicación deliberadamente sencilla para el control de **cuentas por pagar** (proveedores), **cuentas por cobrar** (clientes), **pedidos** e **inventario básico** de un pequeño comercio, con soporte dual de moneda USD/Bs.

Este repositorio parte de su documentación fundacional, generada durante la fase de concepción del proyecto (sin código todavía).

## Documentación

| Documento | Contenido |
|---|---|
| [00-vision.md](docs/00-vision.md) | Problema, propuesta de valor, actores y criterios de éxito |
| [01-alcance.md](docs/01-alcance.md) | Alcance del MVP, exclusiones explícitas e ideas futuras |
| [02-requisitos-funcionales.md](docs/02-requisitos-funcionales.md) | Requisitos funcionales (RF) con criterios de aceptación |
| [03-requisitos-no-funcionales.md](docs/03-requisitos-no-funcionales.md) | Requisitos no funcionales (RNF) con métricas |
| [04-features.md](docs/04-features.md) | Features, priorización MoSCoW y trazabilidad RF↔Feature |
| [05-stack-sugerido.md](docs/05-stack-sugerido.md) | Stack tecnológico sugerido (no decisión cerrada) |
| [06-arquitectura.md](docs/06-arquitectura.md) | Modelo de datos, sincronización, estructura de la app y roadmap |
| [07-mejoras-y-roadmap.md](docs/07-mejoras-y-roadmap.md) | Revisión post-MVP: bugs conocidos, mejoras y próximas features |

## Desarrollo

Stack: React + Vite + TypeScript, Supabase (datos + auth), Dexie/IndexedDB (respaldo local). Web primero, instalable como PWA (manifest mínimo, sin modo offline). CI en GitHub Actions (lint + test + build).

```bash
npm install
cp .env.example .env   # completar credenciales de Supabase
npm run dev
npm test               # pruebas unitarias (lógica dual moneda)
npm run lint           # oxlint
```

El esquema de base de datos se aplica ejecutando [supabase/schema.sql](supabase/schema.sql) en el SQL Editor del proyecto Supabase.
