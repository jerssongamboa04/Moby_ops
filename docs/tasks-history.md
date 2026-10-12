# Tasks: actividad propia por día y mes

## Decisiones confirmadas — 2026-09-26

- Cuenta únicamente la primera actuación de cada usuario sobre una bicicleta en
  cada fecha de calendario. Otro usuario tiene su propio recuento para esa bici.
- Se conservan todas las actuaciones, fotografías y eventos. Las repeticiones se
  muestran como no contabilizadas; no son errores de envío ni pruebas de fraude.
- El corte es a las 00:00 de Europe/Dublin, sin turnos ni ventana móvil de 24 horas.
  Se acepta que un turno nocturno quede repartido entre dos fechas. Un día con
  cambio horario puede durar 23 o 25 horas reales.
- La fecha autoritativa es `created_at`, asignada por PostgreSQL al registrar la
  actuación. `performed_at`, declarado por el teléfono, se conserva para
  trazabilidad pero no puede determinar el recuento. El turno del fin de mes se
  divide también entre los meses correspondientes.
- El mes suma los recuentos diarios. Una bici puede contar nuevamente al día
  siguiente para el mismo usuario. El recuento no suma los checks individuales.

## Implementación y alternativas

Se añade `read_own_tasks(text,date,integer)`, función de lectura `SECURITY INVOKER`
con `search_path` vacío. Exige usuario autenticado y perfil activo, filtra por
`auth.uid()` y respeta RLS. El cliente no suministra el empleado. No amplía roles
ni cambia políticas. `anon` no tiene permiso de ejecución.

La función calcula todos los registros del periodo en el servidor antes de
paginar. `row_number` determina la primera por `created_at` y, si empatan, `id`.
El orden es determinista incluso con timestamps idénticos. Los totales de cada
respuesta usan una misma consulta y snapshot; un reintento que conserva el ID no
genera otra fila. No hace falta persistir un flag mutable ni modificar el envío.
La primera representa el orden de registro del servidor, no una hora declarada
por el trabajador. Los datos anteriores también se resumen con esta regla.

Un índice `(employee_id, created_at desc, id desc)` soporta los filtros por fecha
de recepción. Se mantienen los índices anteriores. No se descarga el mes entero
al teléfono: devuelve agregados diarios; Hoy devuelve hasta 50 registros por
página. Los totales no quedan limitados a 50 ni al límite habitual de 1000 filas.

Alternativas descartadas: agrupar por hora del teléfono (manipulable), descargar
el historial completo para contar en JavaScript (más transferencia y riesgo de
totales truncados), gestionar turnos (fuera del alcance confirmado) y persistir
la clasificación de duplicados (más cambios en escritura y concurrencia).

La pantalla conserva el encabezado aprobado y añade Hoy/Mes, totales, registros
de hoy con hora/acciones/estado, selector de mes y desglose diario. No incorpora
todavía una pantalla de detalle ni descarga de fotografías. Los originales
siguen privados e intactos.

Se consulta al enfocar Tasks, al volver al primer plano, al cambiar periodo,
mediante Actualizar y en la siguiente medianoche indicada por el servidor.
Peticiones de una vista anterior se abortan/ignoran. Se retiran listeners y timers
al salir de Tasks. Un error o timeout muestra reintento, nunca un cero ficticio.
No se añade caché persistente, estado global ni dependencias.

Las páginas usan offset y orden estable por fecha/ID. Si se registran nuevas
actuaciones entre páginas, su posición puede cambiar; Actualizar vuelve a la
primera página. Cada respuesta conserva sus totales completos y coherentes.

## Despliegue y aprobación

Preparado, no aplicado al Supabase real. Según el contrato del proyecto, requiere
aprobación antes de ejecutar la migración. Requiere las tablas, perfiles y RLS
previamente creados en este proyecto.

1. Aplicar `supabase/migrations/read_own_tasks.sql` en SQL Editor tras aprobarlo.
2. Ejecutar `supabase/tests/own_tasks_access.sql` como administrador. Requiere un
   perfil existente, usa un periodo reservado de 1900 y revierte los registros y
   cambios de activación al finalizar. Si hay un error, ejecutar ROLLBACK antes
   de continuar. No modifica objetos de Storage ni registros existentes.
3. Probar la app con la APK actual y Metro; no hay cambios nativos.

## Evidencia de pruebas y límites

- Prueba SQL local inicialmente roja por ausencia del recuento; luego verde.
- PostgreSQL local (PGlite): repetición, otro usuario activo, cambio de día y mes,
  cambios de horario de marzo/octubre, `performed_at` manipulado, perfil inactivo,
  anónimo, parámetros, meses vacíos y 1005 registros con ranking antes de paginar.
- El SQL para SQL Editor también se ejecuta en el entorno local.
- Jest: datos y errores del servicio, estados de pantalla, ES/EN, meses anteriores,
  paginación, respuestas tardías, medianoche, limpieza y navegación con borrador.
- Validación real pendiente: ejecutar SQL en Supabase y revisar en Android.

Aceptación manual: enviar dos actuaciones de la misma bici con un usuario y
observar 1 contabilizada/1 repetida/2 guardadas; comprobar que otro usuario cuenta
su primera actuación independientemente y que ninguno ve datos ajenos. Comprobar
sumas del mes, fechas anteriores, error de conexión y actualización tras enviar
desde Home. No dar por validado el backend remoto solo por pasar PGlite.

Fuentes técnicas: https://supabase.com/docs/reference/javascript/rpc,
https://www.postgresql.org/docs/current/sql-createfunction.html,
https://www.postgresql.org/docs/current/functions-window.html y
https://www.postgresql.org/docs/current/datatype-datetime.html.
