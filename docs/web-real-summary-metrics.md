# Resumen real — cálculo y autorización de métricas

> **Registro técnico de su checkpoint.** Las declaraciones de estado/pendientes
> siguientes describen la fecha original, no necesariamente main actual.
> Para estado integrado y procedimiento de arranque, ver [índice](README.md),
> [arquitectura](architecture.md) y [desarrollo](development.md).
> No repetir migraciones por seguir instrucciones históricas de aplicación.


Fecha: 2026-10-06. Estado: preparado y probado en PostgreSQL aislado;
no aplicado en Supabase ni conectado a la web.

## Cambio de enfoque aprobado

Cada bloque debe conectar comportamiento, datos y permisos reales y reproducir
el mockup. La entrega de tarjetas ficticias no está aprobada ni commiteada.
No continuar añadiendo fixtures de presentación. Reutilizar los iconos Ionicons
móviles al integrar la UI. Este cambio prepara la parte de base de datos;
la sesión web y la sustitución de cifras ficticias siguen pendientes.

## Evidencia remota aportada por Jersson

RLS activado en `profiles` y `public_order_actions`. Roles permitidos: employee y
supervisor. Lectura propia en ambas tablas; acciones requieren perfil activo.
Se confirmaron las columnas de identidad, acciones y marcas temporales.
Manager sigue aprobado como producto futuro pero no existe en el esquema actual;
esta migración no modifica su restricción ni las políticas existentes.

## Consulta propuesta

`public.read_team_summary_metrics(p_month date default null)` devuelve JSON:
month, today, generated_at, month_metrics y today_metrics. Los objetos de
métricas contienen attended, locked, kickstand, repositioned e invalid.
El mes predeterminado es el actual de Europe/Dublin; un mes explícito debe
ser su primer día, finito, desde 1900 y no posterior al mes actual.
Today siempre corresponde al día actual del servidor, independientemente del
mes consultado. No se incorpora un reloj ficticio de la demo.

Solo un perfil supervisor activo vinculado a auth.uid() obtiene resultados.
Employee, supervisor inactivo, identidad inexistente y ausencia de sesión
reciben error 42501; parámetros inválidos, 22023. Mes sin actuaciones devuelve
ceros reales tras consulta exitosa, nunca como sustitución de errores.

Se clasifica primero por employee_id, bike_external_id y fecha de created_at en
Europe/Dublin, con orden created_at e id. Cuenta la primera por combinación;
las restantes son inválidas. Los checks de inválidas no se suman. Cada tarjeta
es un indicador; sumar checks no produce el total de actuaciones. No se filtran
los colaboradores históricos por su estado activo actual. Las fechas futuras
posteriores al instante de consulta no contribuyen al resultado.

## Autorización y consecuencias

Alternativa elegida: función SECURITY DEFINER de agregados en un esquema nuevo
no expuesto, `moby_ops_private`, y entrada RPC pública SECURITY INVOKER.
La función privada necesita leer actuaciones del equipo sin abrir lectura
directa de filas ni ampliar el acceso a evidencias que depende de esa RLS.
Comprueba perfil/rol desde PostgreSQL, no desde parámetros ni el rol del JWT.
Ambas funciones fijan search_path vacío y usan relaciones cualificadas.
Se revoca ejecución pública/anónima y se concede a authenticated; la función
privada vuelve a comprobar autorización aunque se llame directamente.
No añadir moby_ops_private a API Exposed Schemas. No se necesitan claves
administrativas para la web. No se cambian tablas, datos ni permisos de escritura.
El esquema se crea sin IF NOT EXISTS y funciones sin OR REPLACE para detenerse
si hay conflicto con objetos remotos preexistentes. La migración es transaccional.

Alternativa descartada en esta vertical: abrir RLS de actuaciones a supervisor,
pues las políticas actuales de evidencias heredan visibilidad de la actuación.
El acceso a detalle/fotos se diseñará y probará en su propia vertical.

## Pruebas y límites de la evidencia

`supabase/tests/team_summary_metrics_access.sql` se ejecuta como administrador
y termina con ROLLBACK. Crea usuarios/perfiles/actuaciones aislados; no modifica
empleados ni actuaciones existentes. Se detiene ante conflictos con IDs,
periodos reservados de 2024 o la bicicleta de prueba de hoy. Si falla en SQL
Editor, ejecutar ROLLBACK antes de cualquier otra operación.

Comprobaciones: totales del equipo, mismo ID de bicicleta entre colaboradores,
nuevo día, desempate UUID, fecha creada por servidor frente a performed_at,
exclusión de checks repetidos, inicio/fin de mes en Dublín, primavera y hora
repetida de otoño, mes vacío, deltas de hoy/mes actual, parámetros y autorización.
También comprueba que el supervisor no obtiene lectura directa de las filas
ajenas y que un rol supervisor declarado en JWT no sustituye el perfil.

TDD: el mismo test falló ante una implementación provisional con recuentos cero,
por el recuento esperado de marzo; pasó con la consulta completa. Ejecutado en
PostgreSQL 18.3 mediante PGlite 0.5.8, instalado únicamente en el entorno temporal
de validación, sin añadir dependencias a móvil ni web. Se reprodujeron las tablas
y políticas del repositorio y una función auth.uid() basada en la identidad de
prueba. Se verificó además que los fixtures se revierten y las políticas no cambian.
No reproduce la infraestructura Auth/PostgREST/Storage de Supabase, ni sustituye
la prueba remota. Falta confirmar versión remota, permisos del propietario y
resultado del script en Supabase tras revisión y aprobación de la migración.

Siguientes pasos: aprobación/aplicación remota, pruebas SQL en Supabase, sesión
web autorizada y conexión de métricas al bloque visual. No desplegar ni commitear
las tarjetas ficticias como funcionalidad final.

Referencias oficiales:
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://www.postgresql.org/docs/current/sql-createfunction.html
