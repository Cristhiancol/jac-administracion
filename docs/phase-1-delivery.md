# Entrega de Fase 1 — PWA JAC Usme Centro

## Alcance validado

La aplicación se construyó sobre el stack disponible de **React 19, Vite, Express, tRPC y Drizzle/MySQL**. Incluye autenticación del entorno, control de acceso por rol técnico y rol JAC, interfaz responsiva, modo claro/oscuro, soporte PWA, persistencia de módulos principales y pruebas automatizadas.

La ficha institucional se registró con el nombre jurídico suministrado: **Junta de Acción Comunal Barrio Usme Centro / Localidad de Usme**. El NIT y la dirección permanecen en estado **pendiente de verificación**; la aplicación bloquea el estado `verificado` si no existen NIT, dirección y URL de evidencia. El mapa muestra una ubicación provisional en Usme, Bogotá D.C., y deberá sustituirse por las coordenadas de la sede cuando exista dirección oficial validada.

> Esta implementación organiza la información de cumplimiento para la JAC, pero no sustituye la revisión de estatutos ni la validación de una autoridad o asesoría jurídica competente.

## Estado por módulo

| Módulo | Estado | Entregable funcional |
| --- | --- | --- |
| Arquitectura y seguridad | Implementado | Esquema Drizzle, tRPC, procedimientos protegidos y RBAC para Directiva, Coordinador, Tesorero/Fiscal, Secretario y Afiliado. |
| Ficha institucional | Implementado con validación pendiente | Nombre jurídico, NIT editable, dirección editable, fuente de verificación, estado, notas y mapa provisional. |
| Plan de Trabajo Comunal | Base funcional implementada | Planes, comisiones, responsables seleccionables, actividades, metas, cronograma, estado, porcentaje, URL de evidencia y filtros por periodo, comisión y estado. |
| Obligaciones legales | Base funcional implementada | Matriz con fundamento, entidad, periodicidad, vencimiento, notas y estado. Incluye referencias de Ley 2166. |
| Finanzas | Base funcional implementada | Registro de ingresos y egresos, caja por categoría, soporte URL y balance actualizado. |
| Reservas | Lógica y modelo implementados | Validación de horario, solapamiento y esquema de solicitudes; interfaz de reservas queda programada en el backlog. |
| Noticias institucionales | Implementado | Fuente oficial registrada, extractor de títulos, fechas de publicación y consulta, URL y resumen; actualización manual protegida y ruta segura preparada para actualización programada. |
| PWA | Implementado | Manifiesto, registro de service worker de producción y estrategia de caché que no interfiere con desarrollo. |
| Calidad | Validado | Pruebas Vitest, verificación TypeScript, compilación de producción y revisión visual de rutas principales. |

## Evidencia institucional y normativa

El portal de la **Alcaldía Local de Usme** presenta contenido público de noticias, calendario y vínculos institucionales, por lo que fue registrado como fuente oficial para el módulo de sincronización. [1] La matriz legal usa como referencia la Ley 2166 de 2021: las comisiones ejecutan los planes, programas y proyectos definidos por la organización; el artículo 46 incluye la presentación del plan de desarrollo comunal, planes de acción y rendiciones anuales. [2] El IDPAC publica además lineamientos públicos sobre quórum, elección de dignatarios y mínimo de tres comisiones para las JAC en Bogotá. [3]

## Archivos principales generados

| Área | Archivos |
| --- | --- |
| Modelo y persistencia | `drizzle/schema.ts`, `drizzle/0001_equal_mole_man.sql`, `server/db.ts` |
| Dominio y permisos | `shared/jac-domain.ts`, `shared/jac-access.ts`, `shared/jac-forms.ts`, `server/_core/trpc.ts` |
| Lógica de servidor | `server/routers/{institutional,work-plan,finance,obligations,reservations,news}.ts`, `server/integrations/usme-news.ts`, `server/handlers/news-sync.ts` |
| Interfaz | `client/src/pages/{Home,WorkPlan,Obligations,Finance,InstitutionalProfile,News}.tsx`, `client/src/components/jac/*` |
| PWA | `client/public/manifest.webmanifest`, `client/public/sw.js`, `client/src/main.tsx` |
| Pruebas | `server/domain/*.test.ts`, `server/jac-forms.test.ts`, `server/routers.rbac.test.ts`, `server/integrations/usme-news.test.ts` |
| Documentación | `docs/architecture.md`, `docs/configuration.md`, `todo.md`, este documento |

## Resultado de pruebas y validaciones

| Validación | Resultado |
| --- | --- |
| Suite Vitest | **17 pruebas aprobadas** en 7 archivos. |
| Cobertura funcional validada | Cálculo financiero, NIT, vencimiento de obligaciones, disponibilidad de reservas, formularios, evidencia institucional, RBAC y extracción de noticias. |
| Verificación de tipos | `pnpm check` aprobado. |
| Compilación de producción | `pnpm build` aprobado. |
| Revisión visual | Rutas de inicio, plan, ficha institucional, obligaciones, finanzas y noticias revisadas en escritorio y móvil. |
| Base de datos | Migración aplicada; ficha institucional en estado `pendiente`; fuente de la Alcaldía Local de Usme registrada como `verificado`. |

## Pendientes para la siguiente iteración

| Prioridad | Pendiente |
| --- | --- |
| Alta | Suministrar NIT, dirección exacta y URL o documento oficial para validar la ficha y reemplazar el mapa provisional. |
| Alta | Registrar el trabajo real de comisiones, actividades, obligaciones y movimientos financieros desde los perfiles asignados. |
| Media | Conectar carga de archivos a almacenamiento seguro para comprobantes y evidencias. |
| Media | Añadir el calendario visual de obligaciones, el tablero analítico por período/categoría/fuente y la interfaz completa de reservas. |
| Media | Publicar la aplicación y crear la tarea periódica de sincronización usando la ruta `/api/scheduled/synchronize-official-news`; la tarea no debe activarse antes de que exista una versión publicada. |

## Referencias

[1]: https://usme.gobiernobogota.gov.co/ "Alcaldía Local de Usme"
[2]: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=184758 "Ley 2166 de 2021 — Gestor Normativo de Función Pública"
[3]: https://www.participacionbogota.gov.co/atencion-al-ciudadano/preguntas-frecuentes?field_clasificacion_preguntas_fr_target_id=262 "Preguntas frecuentes — IDPAC"
