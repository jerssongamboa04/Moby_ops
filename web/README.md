# MOBY Ops Web

Proyecto Next.js independiente dentro del repositorio móvil. Node 22.12+ de la
rama 22, o Node 24. Lockfile propio; ejecutar comandos desde `web/`.

## Configuración local

Copiar `.env.example` a `.env.local` y sustituir los dos valores por la URL y la
publishable key del mismo proyecto Supabase usado por la app móvil:

```sh
cp .env.example .env.local
npm ci
npm run dev
```

No copiar variables EXPO ni claves administrativas. Las variables web se llaman
NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Usar una clave
`sb_publishable_…`; este bloque no admite claves legacy/secret/service_role.
No subir `.env.local` al repositorio. Configurar valores antes de compilar/reiniciar.

Acceso en `/login` con la cuenta invitada y contraseña ya configurada. Solo un
supervisor activo puede entrar en `/` y `/activity`. No se crea ni promueve ninguna
cuenta desde la web. Sesión server-side en cookies HttpOnly, SameSite=Lax, Secure
en producción. No cliente Auth de navegador ni almacenamiento en localStorage.
Cerrar sesión termina solo la sesión web actual, no la app móvil.

## Validación

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run start
npm audit --omit=dev
```

Sin configuración la build pasa y `/login` informa que falta configurarla;
las páginas protegidas no se convierten en una demo pública. Pruebas automáticas
con respuestas controladas del SDK; validar también el flujo con la cuenta real.

## Estado

Autenticación, autorización y marco ES/EN implementados. Backend de métricas
aplicado y probado en Supabase. Conexión de indicadores a la vista pendiente:
no se muestran cifras ni fechas ficticias. Resumen/Actividad aún contienen un
mensaje provisional; no son los mockups terminados. Callback de invitación,
set-password y recuperación web quedan pendientes; usar la cuenta previamente
configurada por el flujo móvil. No se modificó Site URL ni enlaces móviles.

Documentación: `../docs/web-platform.md`, `../docs/web-real-summary-metrics.md`
y `../docs/web-auth-session.md`.
