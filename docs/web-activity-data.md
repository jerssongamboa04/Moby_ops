# MOBY Ops — Lectura autorizada de Actividad

Fecha: 11 de octubre de 2026.
Base de trabajo reportada por Jersson: `feat/web-foundation`, commit `26b0a9d` publicado.

## Estado y siguiente paso

Migración aprobada y aplicada por Jersson en Supabase el 11 de octubre de 2026.
Las pruebas completas se ejecutaron en SQL Editor y Jersson confirmó el resultado OK.
La corrección de precedencia de la prueba de paginación está incluida y validada.
Checkpoint SQL confirmado: `5a3def0`. El entorno de preparación no tiene acceso remoto.

Este bloque solo añade lectura del listado y pruebas. No modifica la vista web,
Resumen, la app móvil, datos existentes, tablas, RLS ni políticas de Storage.

## Requisitos y orden de construcción

Fuente visual: `docs/design/web/activity-approved.png`.
Actividad abre en Hoy, todos los colaboradores, todas las actuaciones, orden reciente.
Buscar por ID, filtrar colaborador/día/mes/validez y paginar. Después, detalle lateral
con acciones, observaciones, ubicación y fotografías antes/después ampliables.
Usar Archivo/Inter y los iconos MOBY, incluido kickstand. No datos de demostración,
no tab Equipo, no breadcrumb ni timestamp de refresco que se retiraron del resumen.
El dibujo aporta evidencia visual de diseño, nunca etiquetas automáticas de fotografías.

Secuencia acordada: SQL y seguridad del listado → pruebas en Supabase → commit SQL →
cabecera/controles/tabla reales → detalle y autorización de fotos → revisión de toda la vista.
La forma de abrir un periodo y colaborador desde Resumen se conectará al construir la URL
real de Actividad; la tabla de Resumen no tiene enlaces provisionales.

## Contrato de la consulta

`public.read_team_activity(p_view text='day', p_date date=null,
p_employee_id uuid=null, p_bike_query text=null, p_validity text='all',
p_offset integer=0, p_as_of timestamptz=null)` devuelve JSON.

- `day`: fecha seleccionada o hoy de Dublín. `month`: primer día del mes o mes actual.
  Fechas finitas desde 1900, sin periodos futuros ni meses que no comiencen en día 1.
- Colaborador: cualquiera activo o con historial hasta el instante de servidor, igual
  que el selector aprobado. El rol no se presupone a partir del nombre.
- Búsqueda parcial literal por ID: trim y mayúsculas, hasta 10 caracteres alfanuméricos.
  Vacío significa sin búsqueda. No SQL dinámico, comodines ni regex del cliente.
- Validez: `all`, `valid`, `invalid`. Se clasifica primero por persona/bicicleta/fecha
  de `created_at` en Europe/Dublin, orden `created_at,id`. La primera cuenta; las demás
  se conservan y señalan su `duplicate_of`. No usar `performed_at` como fecha autoritativa.
- Página: 25 filas, offset no negativo múltiplo de 25; orden `created_at DESC,id DESC`.
  El tamaño es una decisión de implementación fija, no cambia reglas ni permisos.
- `p_as_of`: instante de corte devuelto por la primera lectura, mantenido al paginar.
  Cambiar filtros o Actualizar inicia un corte nuevo y offset cero. No permite cortes
  futuros ni infinitos. Evita desplazar páginas por registros posteriores al corte.
  Es un límite temporal, no un snapshot MVCC persistente: una modificación administrativa
  o un registro retrodatado podría cambiar el resultado. La escritura operativa actual
  solo crea registros y utiliza tiempo de servidor; no se añade edición desde web.
- Metadatos: `view`, `period`, `today`, `as_of`, `employee_id`, `bike_query`, `validity`,
  `offset`, `page_size`, `total`, `valid`, `invalid`, `has_more`.
  Los tres conteos abarcan todo el resultado filtrado, no solo la página visible:
  `total = valid + invalid`; inválidas no suman actuaciones válidas.
- `items`: id, employee_id, full_name, bike_external_id, created_at, bike_locked,
  kickstand_positioned, bike_repositioned, counted y duplicate_of. No notas, GPS,
  emails, rutas ni URLs de fotografías en el listado. Checks de una inválida se
  muestran como acciones registradas, sin sumarlas a las métricas válidas.

## Seguridad y arquitectura

Mismo patrón aprobado para las métricas: función pública SECURITY INVOKER y motor
privado SECURITY DEFINER, `search_path` vacío, nombres de tablas cualificados.
El motor verifica `auth.uid()` contra perfil activo de rol `supervisor` antes de
validar o leer filtros. Se repite el pequeño guard existente para no ejecutar una
consulta mensual de métricas que el listado no necesita. No se crea una abstracción
de autorización compartida ni se refactorizan las funciones aprobadas.
Se revoca ejecución de PUBLIC y anon; authenticated solo puede ejecutarla con la
comprobación interna. La web seguirá usando sesión de usuario, nunca service_role.

La BD validada solo admite employee/supervisor. «Manager» es la intención de producto,
no un valor añadido silenciosamente a la restricción de roles.

No índices nuevos en esta propuesta: medir el plan con volumen real antes de proponerlos.
El tamaño de página limita la respuesta, no el trabajo de ranking. Consultas de meses
con gran volumen deberán medirse; no se promete rendimiento sin evidencia.

El siguiente bloque de detalle deberá verificar esquema remoto de action_evidence
(before/after, rutas, metadatos) y políticas del bucket privado antes de proponer
la autorización de fotografías al supervisor. Las políticas del repositorio actuales
son de lectura propia; este parche no las amplía ni presume que todas estén aplicadas.

## Pruebas y aplicación manual

Archivo: `supabase/tests/team_activity_access.sql`. Transacción con fixtures reservados,
protección contra colisión de IDs y rollback final. Cubre día/mes, hoy real, búsqueda,
validez, repetición con empate, persona distinta, historial inactivo, cambio horario,
páginas sin solapamiento, corte temporal, datos mínimos, filtros inválidos, acceso
anónimo/empleado/inactivo y conservación de RLS directo. Si falla, ejecutar ROLLBACK
antes de continuar y diagnosticar; nunca modificar datos reales para que pase.

Tras aprobación: ejecutar `supabase/migrations/read_team_activity.sql`; después las
pruebas completas. Esperado:

`OK: activity filters, day/month, search, validity, duplicates, DST, stable pagination, minimal fields, authorization and unchanged direct RLS`.

Referencias revisadas: documentación oficial PostgreSQL CREATE FUNCTION y Window Functions:
https://www.postgresql.org/docs/current/sql-createfunction.html
https://www.postgresql.org/docs/current/functions-window.html
Comparación de regla: `read_own_tasks_day.sql` y `read_team_summary_filters.sql` existentes.

## Corrección de la prueba de paginación

Se agrupan entre paréntesis las tres extracciones `page->'items'` antes de concatenarlas
con `||`. Ambos operadores tienen la misma precedencia y se asocian a izquierda.
La expresión anterior no unía las tres páginas y generaba un falso fallo al contar
IDs distintos. Se mantienen total, tamaño, orden, corte y ausencia de solapamiento.
No se cambia la migración aplicada. La reejecución completa en Supabase dio OK, confirmada por Jersson.
