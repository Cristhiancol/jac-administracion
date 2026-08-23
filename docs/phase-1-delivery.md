# Entrega de Fase 1 — PWA JAC Usme Centro

## Cierre de validación institucional

## Identidad visual Bellavista 1991

Se integraron el emblema vectorial, favicon, paleta azul institucional–verde Usme, hero visual, título de aplicación y README publicados en los commits remotos **89f3a27** y **54cf2be**. La actualización es estrictamente de identidad visual y documentación: se preservaron las migraciones, la tarea diaria de noticias, los procedimientos de seguridad y los datos jurídicos ya verificados en la ficha institucional.

La cabecera fue revisada visualmente en **375×812**, **768×1024** y **1280×720**. En las tres vistas el emblema, el nombre “JAC Bellavista (1991)” y el lema permanecieron visibles, sin desbordamiento horizontal; en móvil y tableta se muestra la navegación compacta, mientras que en escritorio se conserva la navegación completa. La revisión independiente de móvil confirmó una composición clara y utilizable para el panel comunitario.

La ficha institucional quedó en estado **verificado** con NIT **830.061.828-3**, Personería Jurídica **N.º 0837 del 15 de marzo de 1991**, Código Comunal **5084** y sede registrada como **Carrera 54D # 167B-11, Bogotá, Colombia**. La ubicación oficial usa las coordenadas **4.5047526, -74.1068319** y el enlace de Google Maps confirmado por la Directiva. La ubicación se fundamenta en esa confirmación directa; no se presenta como resultado de la geocodificación pública inicial, que fue inconsistente con la localidad declarada.

La sincronización de comunicados de la Alcaldía Local de Usme conserva el control manual para la Directiva y cuenta además con una tarea diaria activa a las **06:00 COT** (`0 0 11 * * *` en UTC). El identificador de la tarea está asociado a la fuente de noticias para que el callback publicado se resuelva de forma segura e idempotente.

## Alcance validado

La aplicación se construyó sobre el stack disponible de **React 19, Vite, Express, tRPC y Drizzle/MySQL**. Incluye autenticación del entorno, control de acceso por rol técnico y rol JAC, interfaz responsiva, modo claro/oscuro, soporte PWA, persistencia de módulos principales y pruebas automatizadas.

La ficha institucional se registró con el nombre jurídico suministrado: **Junta de Acción Comunal Barrio Usme Centro / Localidad de Usme**. El NIT, la dirección, la personería jurídica, el código comunal, las coordenadas y la evidencia de ubicación se encuentran validados por la Directiva. La aplicación mantiene las reglas que bloquean el estado `verificado` cuando falten NIT, dirección o URL de evidencia.

> Esta implementación organiza la información de cumplimiento para la JAC, pero no sustituye la revisión de estatutos ni la validación de una autoridad o asesoría jurídica competente.

## Estado por módulo

| Módulo | Estado | Entregable funcional |
| --- | --- | --- |
| Arquitectura y seguridad | Implementado | Esquema Drizzle, tRPC, procedimientos protegidos y RBAC para Directiva, Coordinador, Tesorero/Fiscal, Secretario y Afiliado. |
| Ficha institucional | Implementado y verificado | Nombre jurídico, NIT, personería jurídica, código comunal, dirección, fuente de verificación, estado, notas y mapa confirmado. |
| Plan de Trabajo Comunal | Base funcional implementada | Planes, comisiones, responsables seleccionables, actividades, metas, cronograma, estado, porcentaje, URL de evidencia y filtros por periodo, comisión y estado. |
| Obligaciones legales | Base funcional implementada | Matriz con fundamento, entidad, periodicidad, vencimiento, notas y estado. Incluye referencias de Ley 2166. |
| Finanzas | Base funcional implementada | Registro de ingresos y egresos, caja por categoría, soporte URL y balance actualizado. |
| Reservas | Lógica y modelo implementados | Validación de horario, solapamiento y esquema de solicitudes; interfaz de reservas queda programada en el backlog. |
| Noticias institucionales | Implementado y programado | Fuente oficial registrada, extractor de títulos, fechas de publicación y consulta, URL y resumen; sincronización manual protegida y tarea diaria activa a las 06:00 COT. |
| PWA | Implementado | Manifiesto, registro de service worker de producción y estrategia de caché que no interfiere con desarrollo. |
| Calidad | Validado | Pruebas Vitest, verificación TypeScript, compilación de producción y revisión visual de rutas principales. |

## Evidencia institucional y normativa

El portal de la **Alcaldía Local de Usme** presenta contenido público de noticias, calendario y vínculos institucionales, por lo que fue registrado como fuente oficial para el módulo de sincronización. [1] La matriz legal usa como referencia la Ley 2166 de 2021: las comisiones ejecutan los planes, programas y proyectos definidos por la organización; el artículo 46 incluye la presentación del plan de desarrollo comunal, planes de acción y rendiciones anuales. [2] El IDPAC publica además lineamientos públicos sobre quórum, elección de dignatarios y mínimo de tres comisiones para las JAC en Bogotá. [3]

## Archivos principales generados

| Área | Archivos |
| --- | --- |
| Modelo y persistencia | `drizzle/schema.ts`, `drizzle/0001_equal_mole_man.sql`, `drizzle/0002_damp_jean_grey.sql`, `drizzle/0003_steady_scream.sql`, `server/db.ts` |
| Dominio y permisos | `shared/jac-domain.ts`, `shared/jac-access.ts`, `shared/jac-forms.ts`, `server/_core/trpc.ts` |
| Lógica de servidor | `server/routers/{institutional,work-plan,finance,obligations,reservations,news}.ts`, `server/integrations/usme-news.ts`, `server/handlers/news-sync.ts` |
| Interfaz | `client/src/pages/{Home,WorkPlan,Obligations,Finance,InstitutionalProfile,News}.tsx`, `client/src/components/jac/*` |
| PWA | `client/public/manifest.webmanifest`, `client/public/sw.js`, `client/src/main.tsx` |
| Pruebas | `server/domain/*.test.ts`, `server/jac-forms.test.ts`, `server/routers.rbac.test.ts`, `server/routers.persistence.test.ts`, `server/institutional.integration.test.ts`, `server/integrations/usme-news.test.ts`, `client/src/components/jac/jac-ui.test.tsx` |
| Documentación | `docs/architecture.md`, `docs/configuration.md`, `todo.md`, este documento |

## Resultado de pruebas y validaciones

| Validación | Resultado |
| --- | --- |
| Suite Vitest | **23 pruebas aprobadas** en 10 archivos. |
| Cobertura funcional validada | Cálculo financiero, NIT, vencimiento de obligaciones, disponibilidad de reservas, formularios, evidencia institucional, RBAC y extracción de noticias. |
| Verificación de tipos | `pnpm check` aprobado. |
| Compilación de producción | `pnpm build` aprobado. |
| Revisión visual | Rutas de inicio, plan, ficha institucional, obligaciones, finanzas y noticias revisadas en escritorio y móvil. |
| Base de datos | Migraciones aplicadas; ficha institucional en estado `verificado`; fuente de la Alcaldía Local de Usme registrada como `verificado` y enlazada a la tarea diaria. |

## Pendientes para la siguiente iteración

| Prioridad | Pendiente |
| --- | --- |
| Completado | NIT, dirección, coordenadas, enlace de ubicación, personería jurídica y código comunal registrados por confirmación de la Directiva. |
| Alta | Registrar el trabajo real de comisiones, actividades, obligaciones y movimientos financieros desde los perfiles asignados. |
| Media | Conectar carga de archivos a almacenamiento seguro para comprobantes y evidencias. |
| Media | Añadir el calendario visual de obligaciones, el tablero analítico por período/categoría/fuente y la interfaz completa de reservas. |
| Completado | Publicación confirmada y tarea diaria activada sobre la ruta `/api/scheduled/synchronize-official-news`. |

## Sincronización con GitHub

## Verificación de vista previa

La vista previa se actualizó después de comparar la copia local con `user_github/main`. Ambas referencias coincidieron en el hash **`16852490e384d445968175bf02d6769311b63d6d`** antes del reinicio del servidor. La interfaz resultante mostró el emblema y el hero de **JAC Bellavista 1991**, confirmando que el entorno de vista previa cargó la versión publicada.

La rama `main` se comparó con `user_github/main` después de actualizar las referencias remotas; la base común y ambos hashes coincidían antes de la publicación final. El commit de sincronización publicado y verificado en GitHub es **`4409c85ca8b2de48208e5ed500babb111cf9b5b8`**. La comprobación posterior confirmó que el hash local y el remoto coincidían y que no quedaban cambios locales.

## Referencias

[1]: https://usme.gobiernobogota.gov.co/ "Alcaldía Local de Usme"
[2]: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=184758 "Ley 2166 de 2021 — Gestor Normativo de Función Pública"
[3]: https://www.participacionbogota.gov.co/atencion-al-ciudadano/preguntas-frecuentes?field_clasificacion_preguntas_fr_target_id=262 "Preguntas frecuentes — IDPAC"
