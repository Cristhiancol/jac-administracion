# Arquitectura de la PWA JAC

La aplicación se implementa sobre el entorno disponible, compuesto por **React 19**, **Vite**, **Express**, **tRPC**, **Drizzle ORM** y base de datos MySQL administrada. Esta arquitectura sustituye el App Router y Prisma inicialmente propuestos sin perder los objetivos funcionales: el cliente React provee la interfaz PWA; Express expone el servidor; tRPC entrega contratos tipados; y Drizzle define las entidades y migraciones.

## Capas funcionales

| Capa | Responsabilidad | Ubicación |
| --- | --- | --- |
| Presentación | Panel responsive, navegación, accesibilidad, modo de alto contraste y páginas por módulo. | `client/src/pages`, `client/src/components` |
| Dominio | Tipos, cálculos de avance, balance, calendario y validación de estados. | `shared`, `client/src/lib` |
| Aplicación | Consultas, mutaciones, validación Zod y control de permisos. | `server/routers`, `server/db.ts` |
| Persistencia | Entidades, relaciones, migraciones y registros trazables. | `drizzle` |
| Integraciones | Mapa institucional, almacenamiento de soportes y actualización de noticias. | `client/src/components/Map.tsx`, `server/_core`, `server/integrations` |
| Calidad | Pruebas unitarias, integración, contratos y validación visual. | `server/**/*.test.ts`, `client/src/**/*.test.tsx` |

## Regla de verificación institucional

La ficha de la JAC mantiene los campos **nombre**, **NIT** y **dirección** como información editable, pero su estado inicial es `pendiente`. La interfaz únicamente mostrará el distintivo **verificado** cuando se registren la URL o documento de soporte, la fecha de revisión y el usuario responsable. No se incluirán valores simulados ni se afirmará que los datos han sido validados mientras no se disponga de evidencia verificable.

## Actualización de noticias institucionales

La fuente inicial validada es el portal público de la Alcaldía Local de Usme: `https://usme.gobiernobogota.gov.co/`. La sincronización conservará la URL original, título, fecha de publicación, fecha de consulta, contenido resumido y estado de validación. El diseño programará una ejecución periódica del lado del servidor mediante una ruta autenticada bajo `/api/scheduled/`; no se usarán temporizadores en memoria.

## Roles JAC

| Rol de negocio | Capacidad principal | Mapeo inicial de acceso |
| --- | --- | --- |
| Presidente / Directiva | Administración de la organización, la ficha institucional y los permisos. | Administrador |
| Coordinador de Comité | Gestión del plan de trabajo, metas, actividades y evidencias de su comisión. | Usuario autenticado con rol JAC |
| Tesorero / Fiscal | Registro, revisión y consulta de movimientos financieros. | Usuario autenticado con rol JAC |
| Secretario | Libro institucional, actas, obligaciones y soporte documental. | Usuario autenticado con rol JAC |
| Afiliado | Consulta de información autorizada y solicitudes permitidas. | Usuario autenticado con rol JAC |

La plantilla incluye los roles técnicos `admin` y `user`. La siguiente fase ampliará el dominio con un rol JAC asignable y controles reutilizables por procedimiento.

## Criterios de calidad

Los cálculos de balance, avances y estados de obligaciones serán funciones puras cubiertas por pruebas unitarias. Las operaciones de creación y actualización se validarán con pruebas de integración tRPC, y el panel se verificará visualmente en escritorio y móvil. La entrega no se considerará lista sin verificación de tipos y ejecución de la suite de pruebas disponible.
