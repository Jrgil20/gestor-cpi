# 03 — Requisitos no funcionales

Convenciones: IDs correlativos `RNF-XXX`, agrupados por categoría, cada uno con métrica verificable. Las métricas no proporcionadas por el usuario se proponen como valores razonables y se marcan como **(supuesto)**.

---

## Usabilidad

### RNF-001 — Consulta de saldos en menos de 30 segundos

Desde que el usuario abre la app, debe poder saber cuánto le debe cualquier cliente y cuánto le debe él a cualquier proveedor en **menos de 30 segundos** (criterio de éxito del MVP, supuesto 5).

- **Métrica:** tiempo desde apertura de la app hasta visualizar el saldo de un cliente o proveedor concreto < 30 s.

## Rendimiento

### RNF-002 — Carga del dashboard

El dashboard principal debe cargar sus tres indicadores (saldos por cliente, saldos por proveedor, stock) en **menos de 3 segundos** con el volumen de datos típico de un pequeño comercio (~centenares de registros). **(supuesto: métrica propuesta, no dada por el usuario)**

- **Métrica:** tiempo de carga del dashboard < 3 s con hasta 500 clientes/proveedores y 1 000 pedidos.

## Portabilidad

### RNF-003 — Multi-dispositivo

La app debe poder usarse desde varios dispositivos del mismo usuario. La base tecnológica es **TypeScript**, con **Capacitor como candidato** para el empaquetado móvil (restricción de plataforma dada).

- **Métrica:** la misma funcionalidad core (RF-001…RF-012) opera en al menos dos tipos de dispositivo (p. ej. computadora y teléfono) sin ramas de código separadas por plataforma.

## Datos y disponibilidad

### RNF-004 — Respaldo local sincronizado

La data debe persistirse en la nube (transaccionalidad) y respaldarse localmente, sincronizando el respaldo al iniciar la app. No se requiere funcionamiento 100 % offline: el almacenamiento local es respaldo, no modo primario de trabajo (supuesto 4).

- **Métrica:** tras iniciar la app con conexión, el respaldo local refleja el 100 % de las transacciones confirmadas en la nube.

## Operación y despliegue

### RNF-005 — Despliegue simple y mínima dependencia externa

El despliegue debe ser lo más simple posible, con mínima dependencia de servicios externos; la nube se usa solo para transaccionalidad y respaldo (restricción de infraestructura dada). En particular, la tasa de cambio no depende de ninguna API externa (supuesto 1).

- **Métrica:** el sistema completo depende de a lo sumo **un** servicio externo gestionado (el de persistencia en la nube), y puede desplegarse/actualizarse con un solo comando o pipeline.

## Seguridad

### RNF-006 — Acceso autenticado

El acceso a la data debe estar protegido por autenticación de cuenta, dado el uso multi-dispositivo con nube y la evolución prevista a 2-3 usuarios (F-08). **(supuesto: requisito derivado, no expresado literalmente por el usuario; el mecanismo concreto se decide en la fase de diseño)**

- **Métrica:** ninguna operación de lectura o escritura sobre la data es posible sin una sesión autenticada válida.
