# Resumen: lógica de filtros por mes y colaborador

> **Registro técnico de su checkpoint.** Las declaraciones de estado/pendientes
> siguientes describen la fecha original, no necesariamente main actual.
> Para estado integrado y procedimiento de arranque, ver [índice](README.md),
> [arquitectura](architecture.md) y [desarrollo](development.md).
> No repetir migraciones por seguir instrucciones históricas de aplicación.


Fecha: 2026-10-07. Estado: migración propuesta y pruebas SQL aprobadas localmente.
No aplicada en Supabase. La web aún utiliza la consulta anterior sin filtros.

## Objetivo y alcance

Preparar la barra del mockup con datos reales. Mes y colaborador son parámetros
de la consulta; Actualizar repetirá la lectura manteniendo la selección. La UI,
validación de parámetros de URL y estilos se implementarán tras validar este SQL.
El ajuste pendiente de retirar «Operaciones / Resumen» se retomará en ese bloque.

No modificar tablas, datos operativos, políticas RLS ni permisos de escritura.
Sin service_role en web, dependencias nuevas o cambios en la app móvil.
Manager sigue sin existir en el esquema; autorización actual: supervisor activo.

## Contratos

### read_team_summary_metrics_filtered(p_month date default null, p_employee_id uuid default null)

- p_month null: mes actual del servidor en Europe/Dublin.
- Mes explícito: primer día de mes, finito, desde 1900 y no futuro.
- p_employee_id null: todos los colaboradores. UUID explícito: persona elegible.
- Devuelve month, today, generated_at, employee_id (null para todos), month_metrics
  y today_metrics. Métricas: attended, locked, kickstand, repositioned e invalid.
- Los valores mensuales corresponden al mes seleccionado. Hoy corresponde siempre
  al día actual de Dublín, para la misma selección de colaborador. No es el último
  día ni un día arbitrario del mes histórico seleccionado.
- Solo cuentan fechas created_at no posteriores al instante de consulta. Regla de
  duplicados intacta: colaborador/bicicleta/día, primera por created_at e id.
  Filtrar colaborador preserva particiones completas porque employee_id participa
  en esa regla. Clasificación previa a cualquier filtro de validez o paginación.
- Persona activa sin actuaciones: ceros reales. Error de acceso: 42501. Mes o UUID
  no elegible/desconocido: 22023. UUID mal formado se rechaza al convertir el tipo;
  la web deberá validarlo antes de consultar. Nunca convertir errores en ceros.

### read_team_summary_collaborators()

Array JSON de objetos con únicamente id, full_name e is_active. Sin correos,
roles, preferencias, ubicaciones ni evidencias. Orden por nombre y UUID; personas
con el mismo nombre conservan identificadores diferentes.

Incluye todos los perfiles activos, incluso supervisores que también registran
actuaciones. Incluye perfiles inactivos con actuaciones creadas hasta el instante
de consulta, para no perder historia. Excluye inactivos sin historia o con datos
únicamente futuros. Esta elegibilidad coincide con la validación del filtro.
No borra ni reactiva cuentas. El estado permitirá etiquetar perfiles inactivos en
la UI. La lista no cambia por mes: la selección sigue disponible al cambiar periodo.

El alcance es el mismo conjunto global de perfiles/actuaciones de este proyecto
Supabase utilizado por las métricas actuales; no existe una relación de equipos
u organizaciones en el esquema confirmado.

## Arquitectura y compatibilidad

Funciones públicas SECURITY INVOKER, lógica privada SECURITY DEFINER con
search_path vacío y relaciones cualificadas. Ambas funciones privadas verifican
su propio auth.uid() contra profiles: no aceptan roles desde parámetros o JWT.
Ejecución revocada a PUBLIC/anon; authenticated solo obtiene datos si supera esa
verificación. moby_ops_private sigue fuera de los esquemas expuestos de la API.

El RPC anterior read_team_summary_metrics(date) conserva su firma, parámetros
predeterminados y JSON sin employee_id. Su entrada pública no cambia. Se reemplaza
únicamente el cuerpo privado team_summary_metrics(date) por una delegación al
nuevo cálculo común, retirando employee_id del resultado. Evita mantener dos
implementaciones de la regla de duplicados. Nuevos nombres públicos evitan
sobrecargas ambiguas al llamar sin parámetros.

La migración requiere el RPC inicial aplicado y termina si falta. Los objetos
nuevos se crean sin OR REPLACE: un conflicto obliga a revisar, no a sobrescribir
funciones inesperadas. La única sustitución deliberada es la función privada
anterior. Es transaccional e incluye NOTIFY pgrst para actualizar el catálogo API.
No amplía SELECT directo de profiles/public_order_actions ni acceso a fotografías.
Amplía deliberadamente lo que puede consultar un supervisor: la lista mínima
para el selector, además de agregados filtrados.

La web actual puede continuar operativa después de aplicarla. Para habilitar los
filtros después, habrá que conectar el RPC nuevo, validar mes/UUID y adaptar el
validador TypeScript, que hoy admite solo el mes actual. Filtros en URL según el
contrato del producto; no mover selección/credenciales a un estado global nuevo.

## Evidencia local y límites

PostgreSQL 18.3 con PGlite 0.5.8 en entorno aislado, sin dependencia en el proyecto.
Se reprodujeron las tablas y RLS existentes y auth.uid() para las identidades de
prueba. Pasaron el script previo y el nuevo. Se verificó que no cambia pg_policies
ni quedan usuarios de prueba tras ROLLBACK.

Cobertura: una persona frente al equipo; mismas bicicletas entre personas;
desempate por UUID, checks de repetidas excluidos, historia inactiva, persona sin
actuaciones, cuentas supervisor con actuaciones, límite de mes en primavera,
hora repetida en otoño, hoy real con mes histórico, futuros excluidos, meses y
personas inválidos, nombres repetidos, minimización de campos, RPC previo sin
parámetros, empleado/supervisor inactivo/desconocido/sin identidad/anon rechazados,
invocaciones privadas rechazadas y lectura directa de filas ajenas aún denegada.
Una mutación SQL válida que omite el filtro de persona produce el fallo esperado
«selected collaborator...». La implementación completa vuelve a pasar.

Esto no ejecuta PostgREST, Supabase Auth ni la instancia remota. Falta autorización,
aplicación y pruebas SQL de Jersson en Supabase. No afirmar que los filtros de la
web están conectados todavía.

## Aplicación y validación remotas, solo tras aprobación

1. Revisar supabase/migrations/read_team_summary_filters.sql y esta propuesta.
2. Tras aprobación explícita, ejecutar la migración completa en SQL Editor.
3. Ejecutar supabase/tests/team_summary_filters_access.sql como administrador.
   Crea seis usuarios/perfiles y diez actuaciones reservadas; no modifica personas
   existentes. Se detiene si los IDs ya existen. Finaliza con ROLLBACK; si falla,
   ejecutar ROLLBACK antes de cualquier otra operación.
4. Resultado esperado: «OK: month/person filters, real today, historical/active
   roster, zero counts, duplicates, DST, legacy compatibility, authorization and
   unchanged direct RLS». Comprobar además que las tarjetas actuales siguen cargando.
5. Registrar el resultado antes del commit y comenzar la integración de controles.

Regla de aprobación: sección 0.6 de la documentación del proyecto, «Detenerse y
pedir confirmación antes de cambios destructivos, migraciones, políticas RLS... ».
La preparación local está autorizada; la aplicación remota queda por aprobar.

Referencias oficiales consultadas:
- https://supabase.com/docs/guides/database/functions
- https://docs.postgrest.org/en/stable/references/api/functions.html
- https://www.postgresql.org/docs/current/sql-createfunction.html
