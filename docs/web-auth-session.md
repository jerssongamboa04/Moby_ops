# Sesión web y acceso autorizado a MOBY Ops

Fecha: 2026-10-06. Base del usuario: `142b6a0` con el parche de tarjetas aún
aplicado y sin commit. Estado: implementado y validado automáticamente;
inicio/cierre de sesión con Supabase real y revisión visual pendientes.

## Alcance aprobado

Jersson autorizó @supabase/supabase-js 2.117.2 y @supabase/ssr 0.12.7 para web.
SDK y SSR instalados con versiones exactas en package.json/lockfile de web.
No se cambian dependencias móviles, SQL remoto, políticas, roles ni cuentas.

`/login` acepta email/contraseña de cuentas invitadas con contraseña configurada.
Resumen y Actividad comprueban identidad mediante auth.getUser() en el servidor,
y leen su perfil propio bajo RLS, por el ID verificado. Solo supervisor activo.
No confiar en roles de parámetros, localStorage, cookies sin verificar o metadatos
aportados por la interfaz. Manager permanece pendiente de ampliación del esquema.

Cada página verifica autorización; no depender solo de un layout reutilizado.
Perfil inactivo, employee o perfil ausente no obtienen las vistas. Fallos de Auth
no asociados a sesión inválida y errores de PostgreSQL muestran error de servicio,
no una página vacía ni datos ficticios. Errores de login genéricos; nunca devolver
mensajes internos, tokens o detalles de cuentas. Contraseña sin trim; email con
trim. Límites de tamaño y validación en Server Action además del formulario.

Cerrar sesión usa scope local: no revocar las sesiones móviles. Se verifica el
resultado antes de redirigir. Tras login/cierre se invalida Router Cache.
Las Server Actions conservan la comprobación de Origin de Next.js; no configurar
allowedOrigins abiertos. Supabase conserva sus límites de Auth. No signup público.

## Decisión SSR

Cliente creado por petición. No singleton servidor ni estado compartido entre
usuarios. Proxy Next 16 renueva/verifica claims y propaga chunks de cookies tanto
al request como al response, incluyendo los headers de caché del SDK.
Las páginas vuelven a verificar el usuario con getUser para detectar una sesión
revocada. Cookies HttpOnly (no hay cliente Auth de navegador), SameSite Lax,
Secure en producción. Clientes de páginas no escriben cookies: renovación en
Proxy y escrituras explícitas en Actions. No añadir almacenamiento duplicado.

Rutas autenticadas force-dynamic; fetches Supabase no-store y respuestas Proxy
private,no-store. Sin ISR ni caché compartida. La sesión no se utiliza para
otorgar acceso de equipo en cliente: la RPC sigue autorizando en PostgreSQL.
Alternativa descartada: cliente de navegador con almacenamiento local y una
segunda sincronización de sesión. No se necesita para este acceso server-side.

## Configuración

`web/.env.example` contiene únicamente placeholders y está permitido en Git.
`web/.env.local` sigue ignorado. Configurar URL del proyecto y publishable key
con nombres NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
Solo admite prefijo sb_publishable_; rechaza secret/legacy. HTTPS, salvo loopback
para desarrollo. No compartir archivos completos de entorno ni claves privadas.
Configurar antes de build/reiniciar; sin configuración se bloquea el formulario
con mensaje y las rutas protegidas redirigen a login. CI puede compilar sin keys.

## Retirada de demo y estado visual

Se elimina el bloque de métricas ficticias no aprobado, sus tests y su documento.
Se retiran la fecha fija y el perfil ficticio/aviso DEMO: nombre e iniciales llegan
ahora del perfil real autorizado. No se añaden ceros ni guiones que oculten un
error de datos. Resumen y Actividad conservan su mensaje provisional hasta integrar
las consultas. La retirada de fixtures no implica que las métricas estén conectadas.

Login utiliza marco funcional con logos originales, Archivo/Inter y tokens.
No se declara como nuevo mockup aprobado ni como diseño final de Resumen/Actividad.
Fidelidad de las vistas y reutilización de Ionicons móviles se mantienen como
criterios del siguiente bloque visual, junto a las métricas reales.

Invitación/callback/set-password/recovery web pendientes; no cambiar Site URL,
plantillas o enlaces móviles. Para validar este acceso utilizar cuenta ya invitada
con contraseña configurada. Las invitaciones siguen gestionándose fuera de web.

## Evidencia

40 pruebas en seis archivos: acceso y errores de perfil/Auth, formulario bilingüe,
estado pendiente/reintento, credenciales genéricas, cierre local, configuración,
protección de ambas páginas, propagación de cookies/cache y navegación ES/EN.
Las cinco pruebas del shell prueban el componente con un nombre de fixture de
prueba, no convierten páginas protegidas en componentes síncronos ni mockean Auth.
Pruebas de servidor controlan la frontera SDK; no sustituyen un E2E contra Supabase.
TDD de acceso: fallos por ausencia de autorización ante implementación inicial
mínima; verde tras consultar identidad/perfil. Ciclo rojo/verde adicional para
refresh token revocado. Lint sin avisos, typecheck y build aprobados.
Arranque de producción HTTP: /, /activity y /access-denied sin configuración
redirigen a /login; /login responde 200 con mensaje de configuración. Headers
private,no-store comprobados. Sin credenciales reales utilizadas en el entorno.

npm audit omit=dev: cero vulnerabilidades. Audit completo: los cinco avisos altos
existentes de braces/micromatch/fast-glob/config ESLint; sin nueva vulnerabilidad
reportada de producción. No aplicar audit fix --force ni ampliar esta excepción.
No hay navegador instalado: apariencia, login real y cookies en navegador pendientes.

Validación manual requerida: credenciales incorrectas; supervisor activo; acceso
directo a ambas rutas sin sesión; perfil employee/inactivo; recarga/navegación;
cierre y regreso con botón Atrás; rechazo tras desactivar perfil; comprobar nombre
real y ausencia de cifras demo. En localhost usar npm run dev si el navegador
no acepta cookies Secure del arranque de producción sobre HTTP; producción debe
usar HTTPS. Verificar cache y renovación en el despliegue cuando se autorice.

Referencias oficiales y versionadas:
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Next 16.3.8: node_modules/next/dist/docs/01-app/02-guides/authentication.md
- Next 16.3.8: documentación instalada de proxy y Server Actions.
