# Actividad: detalle y evidencias privadas

Fecha: 2026-10-11. Estado: migración aprobada, aplicada y pruebas SQL validadas por Jersson; commit `5ca37f4`.

## Evidencia del entorno

Jersson confirmó las ocho columnas de `action_evidence`, su política de lectura
mediante la actuación visible y las políticas de Storage de lectura/subida propias
para usuarios activos. El bucket `public-order-evidence` es privado, admite WebP
y tiene un máximo de 5 MiB por archivo.

La lista web y sus filtros están validados manualmente y guardados en `4acb141`.
Este cambio prepara únicamente los datos y permisos del siguiente bloque visual.

## Contrato

`public.read_team_activity_detail(p_action_id uuid, p_as_of timestamptz default null)`
devuelve un objeto o SQL NULL si la actuación no existe o queda fuera del corte.
Requiere identidad autenticada y perfil de supervisor activo en la base de datos.
Las credenciales o el rol enviado por el cliente no otorgan acceso.

Campos: `id`, `employee_id`, `full_name`, `bike_external_id`, `created_at`,
`bike_locked`, `kickstand_positioned`, `bike_repositioned`, `counted`,
`duplicate_of`, `notes`, `latitude`, `longitude`, `as_of`, `evidence`.
Cada evidencia contiene `id`, `phase`, `storage_path` y `captured_at`.
Las evidencias se ordenan antes/después y luego por fecha/ID; no se inventa una
foto si falta ni se ocultan silenciosamente filas múltiples del mismo tipo.

La validez usa exactamente la regla de la lista: primera actuación por empleado,
bicicleta y día de Dublín, ordenada por `created_at,id`. `performed_at` no decide
la fecha operativa. Un empleado distinto puede atender la misma bicicleta.
Se admite el corte de la lista para conservar la consistencia durante la revisión.
Como en la lista, este corte no es una instantánea persistente frente a cambios
administrativos posteriores. Las observaciones se entregan como texto, nunca HTML.

## Permisos

Se añade una sola política SELECT de Storage y tres funciones nuevas:
el RPC público SECURITY INVOKER, la lectura privada SECURITY DEFINER y una
comprobación booleana privada para Storage. Las funciones privadas tienen
`search_path` vacío, relaciones cualificadas y comprobación del perfil real.
Se revoca ejecución a PUBLIC/anon y se concede solo a authenticated.

La política permite al supervisor activo leer objetos del bucket de evidencias
solo cuando tienen una evidencia registrada, WebP/tamaño admisibles y una ruta
que coincide con empleado, actuación y fase. No consulta `storage.objects` desde
la función de autorización: evita recursión de su RLS. No expone la función
booleana mediante un RPC público ni acepta identidad/rol como parámetros.

La lectura directa de `profiles`, `public_order_actions` y `action_evidence`
mantiene su RLS propia. Permanecen las políticas actuales de subida/lectura propia.
No se conceden UPDATE/DELETE/INSERT adicionales ni se cambia el bucket.
El permiso SELECT de Storage también permite enumerar los objetos autorizados;
no da acceso a archivos sin vinculación registrada.

La futura web firmará las rutas con el cliente Supabase autenticado del servidor,
sin service_role. Duración utilizada en el bloque web: 5 minutos.
Una URL firmada es un acceso temporal por posesión: revocar el perfil impide
emitir nuevas URLs, pero una URL ya emitida puede seguir vigente hasta caducar.
Este SQL no genera URLs ni prueba una descarga HTTP real.

## Validación y ejecución

- Revisión estática de SQL y comprobación del parche: realizada al prepararlo.
- Ejecución PostgreSQL: validada por Jersson en Supabase el 2026-10-11.
  El script devolvió OK en todas sus comprobaciones. El entorno de preparación
  no ejecutó PostgreSQL; la evidencia de ejecución procede de Supabase.
- `supabase/tests/team_activity_detail_access.sql` crea metadatos sintéticos
  en una transacción y hace ROLLBACK: no sube fotos ni modifica archivos reales.
  Comprueba detalle real, notas/coordenadas, campos mínimos, orden de fotos,
  concordancia con la lista, duplicados con empate, medianoche Dublín, histórico,
  corte temporal, archivos registrados/huérfanos/ruta incorrecta, lectura propia,
  denegación por rol/inactividad, ACL y conservación de RLS directa.
- Procedimiento ya realizado: ejecutar primero la migración y después el script de pruebas
  completo en SQL Editor como administrador. Si una prueba falla, ejecutar
  ROLLBACK y compartir el error; no hacer commit ni continuar con el panel.
- La firma y descarga real de fotos antes/después se comprobarán con la interfaz.

La migración usa CREATE, no CREATE OR REPLACE: no se debe ejecutar dos veces.
Todo el cambio de permisos se realiza dentro de una transacción.

## Referencias revisadas

- https://supabase.com/docs/guides/storage/security/access-control
- https://www.postgresql.org/docs/current/sql-createfunction.html
- Documentación del proyecto, secciones 0.5, 0.6 y 9.
