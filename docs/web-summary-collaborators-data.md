# Actividad por colaborador — contrato de datos

Fecha: 2026-10-08. Estado: propuesta local preparada y revisada; migración y pruebas PostgreSQL pendientes de aprobación y ejecución en Supabase.

## Sección siguiente

Tras la revisión de hero, filtros, gráfica y tarjetas, sigue la tabla del mockup: colaborador, atendidas, aseguradas, pata colocada, reposicionadas e inválidas, seguida de una fila Total. La lectura debe respetar el mes y el colaborador seleccionados. Los valores serán reales; las inválidas se mantienen fuera de los conteos válidos.

Este checkpoint prepara el SQL. La conexión web y los estilos se entregarán tras validar la migración. No sobrescribe el ajuste local de tamaño del icono de kickstand.

## Función propuesta

`public.read_team_summary_by_collaborator(p_month date default null, p_employee_id uuid default null)` devuelve JSON con:

- `month`, `today`, `generated_at`, `employee_id`.
- `rows`: lista ordenada por nombre e ID; cada objeto contiene únicamente `id`, `full_name`, `is_active`, `metrics`.
- `metrics`: los cinco conteos `attended`, `locked`, `kickstand`, `repositioned`, `invalid`.
- `total_metrics`: suma de todas las filas devueltas, también para el filtro individual.

Un colaborador activo sin actividad aparece con ceros reales. Los inactivos con historia siguen disponibles; los inactivos sin historia o con registros únicamente futuros quedan fuera. Se mantiene la elegibilidad ya aprobada del selector, incluso supervisores que registran actuaciones. Las personas con nombres iguales conservan IDs distintos. No devuelve correos, roles, notas, bicicletas, ubicaciones ni fotografías.

Mes null significa el mes actual de Europe/Dublin. Mes explícito debe ser el primer día de un mes finito entre enero de 1900 y el mes actual. Un UUID seleccionado debe corresponder a una persona elegible. Errores: 42501 para acceso denegado y 22023 para parámetros no disponibles/válidos. La web validará el formato antes de consultar.

## Arquitectura, seguridad y coste

La función pública es SECURITY INVOKER. La lógica privada es SECURITY DEFINER con search_path vacío y relaciones cualificadas. Antes de leer perfiles/actuaciones, llama al motor privado existente `team_summary_metrics_filtered`, que verifica auth.uid() contra el perfil activo de supervisor, valida los parámetros y proporciona el instante de lectura. La autorización procede del perfil de base de datos, no de un rol enviado por cliente o claim arbitrario.

La operación realiza una llamada RPC para todo el desglose. Internamente reutiliza el motor actual para validación/metadata y ejecuta una agrupación mensual para todas las filas; no calcula un agregado separado por persona. Las pruebas comparan cada fila y el total con el motor actual. No se modifica el SQL existente para extraer una abstracción anticipada.

La clasificación mensual reproduce exactamente la regla del motor: created_at del servidor, límites Europe/Dublin, primera actuación por colaborador/bicicleta/día ordenada por created_at e ID; los checks de repeticiones no suman a las acciones válidas. La clasificación ocurre antes de agregar por colaborador. No se introducen flags mutables.

Ejecución revocada a PUBLIC y anon; authenticated invoca solo si supera la autorización. No se amplía ninguna política RLS ni acceso directo a las tablas, ni se añaden permisos de escritura, dependencias o secretos. moby_ops_private continúa sin exponerse como esquema de API. La migración crea dos funciones nuevas dentro de una transacción y solicita recarga del esquema PostgREST; aborta si falta la función base o ya existen los nuevos nombres.

## Pruebas y estado real

`supabase/tests/team_summary_by_collaborator_access.sql` prepara seis identidades y diez actuaciones con IDs reservados, rechaza colisiones, verifica el resultado y termina en ROLLBACK. Si un test aborta, hacer ROLLBACK antes de continuar. No se confirma ningún dato de prueba.

Casos: filtro individual/equipo, empate por ID, exclusión de checks duplicados, bicicletas por personas distintas, historia de inactivos, personas sin actuaciones, cambio horario y límites mensuales Dublin, fecha autoritativa created_at, futuro excluido, mes predeterminado, límite 1900, parámetros inválidos, orden estable con nombres repetidos, mínimos campos de perfil, coincidencia filas/Total/tarjetas, rechazo de empleados/inactivos/identidad ausente y claims falsos, ejecución anónima/PUBLIC y RLS directa intacta.

Revisión local del SQL y comprobación de aplicación/whitespace del parche realizadas. **Las pruebas SQL no se han ejecutado aquí:** el entorno no dispone de PostgreSQL. No se ha modificado la base remota. La validación del comportamiento y de los permisos debe obtenerse del SQL Editor después de aprobar esta propuesta.

## Pasos posteriores a la aprobación

1. Aplicar el parche al repositorio local con git apply --check y git apply.
2. Revisar y aprobar esta migración concreta antes de ejecutarla en Supabase.
3. Ejecutar completo `supabase/migrations/read_team_summary_by_collaborator.sql` en el SQL Editor administrador: se espera Success, no rows returned.
4. Ejecutar completo `supabase/tests/team_summary_by_collaborator_access.sql`. Se espera una fila `OK: collaborator rows, footer/card agreement, filters, zeros, inactive history, duplicates, DST, metadata, authorization and unchanged direct RLS`, seguida del rollback de fixtures.
5. Registrar el resultado, revisar y crear el commit SQL. Conectar la tabla web, sus errores, ES/EN, estilos y pruebas de comportamiento en el siguiente bloque.

La autorización actual sigue siendo supervisor activo; manager no existe en el esquema confirmado.

## Referencias primarias

- https://supabase.com/docs/guides/database/functions
- https://www.postgresql.org/docs/current/functions-window.html
- https://www.postgresql.org/docs/current/sql-createfunction.html

Se aplica la sección 0.6 del contrato del proyecto: confirmar antes de migraciones. Preparar este archivo no constituye autorización para ejecutarlo remotamente.
