# Datos de demostración del dashboard

Fecha: 12 de octubre de 2026. Carga manual autorizada por Jersson para probar
métricas/gráficos/listado con diferentes colaboradores. No es una migración.

## Decisiones

- Conservar las 12 actuaciones y 24 fotos originales reportadas por Jersson.
- No copiar fotos, crear evidencias ni tocar Storage para los datos nuevos.
- Renombrar únicamente el supervisor aa116607-be9b-4297-81e9-c63d8425b121,
  actualmente Empleado de prueba, a Jersson Gamboa. Conservar su rol y acceso.
- Añadir Ubaldo Gonzalez, Victor Benitez, Jimfranc Delgado y Papa Alioune como
  perfiles de demostración. Sus nombres no acreditan trabajo real de estas personas.
- Perfiles demo employee/inactivos: sirven para consulta histórica, no para acceder
  a la app. El selector y los agregados vigentes incluyen perfiles con actuaciones.
- Usar Auth Dashboard para crear cuentas; no INSERT/UPDATE directos en auth.users,
  claves administrativas, contraseñas en archivos ni emails de invitación.
- Cada actuación nueva lleva la nota exacta
  `[DEMO:dashboard-20261012-v1] Simulación sin fotografía.`. Ubicación sintética
  53.3498,-6.2603 y códigos del rango reservado 39E9900001–39E9900600.
  Estas acciones inflan las métricas globales hasta retirar la carga.

## Preparación de las cuentas (una vez)

En Supabase → Authentication → Users → Add user → Create new user, crear
cuatro cuentas con contraseña aleatoria distinta y privada. No usar la acción
Invite user. No es necesario enviar correos ni facilitar contraseñas al asistente.

| Cuenta de prueba | Perfil que creará el SQL |
| --- | --- |
| demo.ubaldo@moby-ops.example.com | Ubaldo Gonzalez |
| demo.victor@moby-ops.example.com | Victor Benitez |
| demo.jimfranc@moby-ops.example.com | Jimfranc Delgado |
| demo.papa@moby-ops.example.com | Papa Alioune |

Los emails usan un subdominio de example.com reservado para ejemplos. No se
usan las direcciones reales de los colaboradores. El SQL exige exactamente
una cuenta por dirección y que estas cuentas todavía no tengan perfiles. Si
un trigger remoto creó un perfil, el script se detiene sin sobrescribirlo:
inspeccionar esa situación antes de ajustar la carga.

## Carga

En SQL Editor ejecutar completo supabase/demo/load_dashboard_demo.sql.
La transacción renombra el supervisor, crea cuatro perfiles y añade 600 filas.
No cambia permisos ni crea tablas permanentes. No ejecutar como migración CI.
Si falla, ejecutar ROLLBACK y compartir el error, sin repetir ajustes a ciegas.
No ejecutar dos veces; el segundo intento falla sin duplicar registros.

Se distribuye desde cinco meses anteriores hasta el mes actual de Dublín:
50, 70, 90, 110, 130 y 150 registros. Para una ejecución en octubre de 2026,
corresponde a mayo–octubre. El mes actual se concentra en el día de ejecución
para probar Hoy y paginación, con timestamps anteriores al instante de carga.
Los otros meses distribuyen las actuaciones por sus primeros 28 días.
Los seis meses juntos contienen 540 válidas y 60 inválidas (duplicados mismo
empleado/bicicleta/día Dublín). Volumen por colaborador: Jersson 180, Ubaldo 120,
Victor 120, Jimfranc 60 y Papa 120. Los contadores no incluyen las filas originales.
En el caso reportado, la base pasaría de 12 a 612 actuaciones y seguiría con 24 fotos.

## Retirada (solo cuando Jersson decida eliminar la demo)

Ejecutar completo supabase/demo/remove_dashboard_demo.sql. Borra exclusivamente
los IDs deterministas de esta carga y exige su nota y rango de bicicleta de prueba.
Se detiene si hay fotos/eventos nuevos vinculados o cambia la nota/rango de los
registros reservados. Nunca borra evidencias, Storage, cuentas ni perfiles.
Conserva el nombre corregido Jersson Gamboa. Los perfiles demo quedan inactivos
sin historial y dejan de aparecer en el selector. La eliminación de sus cuentas
no está incluida; se revisará aparte si se solicita.

## Validación y límites

SQL ejecutado en PostgreSQL mediante PGlite 0.5.8 disponible en scratch, usando
las migraciones vigentes y un esquema mínimo de Auth para simular las cuentas.
No simula internamente GoTrue ni los triggers remotos de Supabase Auth.

Pruebas aprobadas: rollback por cuentas ausentes, conteo/distribución de 600,
540 válidas/60 duplicados mediante RPC real, selector con cinco colaboradores,
página de 25 sobre 150 registros de Hoy, preservación exacta de las 12 filas y
24 evidencias simuladas, mismo estado de RLS, rechazo al cargar dos veces,
rechazo de retirada si cambia una nota y retirada limitada a la demo.

La ejecución remota y la revisión visual están pendientes. Verificar: seis
barras de diferente altura, cambio de mes/persona, totales e inválidas por
colaborador, Hoy y paginación, detalle mostrando Sin fotografía registrada
para la demo y fotografías originales funcionando. No se ha accedido a la BD
remota ni creado cuentas desde este entorno.

Referencias oficiales consultadas:
- https://supabase.com/docs/guides/local-development/seeding-your-database
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/troubleshooting/auth-error-500-database-error-querying-schema-eb6b44
