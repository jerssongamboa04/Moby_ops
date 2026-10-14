# MOBY Ops Web

Dashboard de consulta para supervisores activos, integrado con el mismo proyecto
Supabase de la aplicación móvil. Next.js App Router, React, TypeScript, Tailwind,
i18next y Supabase SSR. La gráfica implementada es SVG; no utiliza Recharts.

Estado: `main` tras PR #4, 14 de octubre de 2026. Summary y Activity están
conectados a datos reales y adaptados a móvil; no son pantallas provisionales.

## Ejecutar

Desde `web/`, con Node `^22.12.0 || ^24.0.0`:

```bash
npm ci
cp .env.example .env.local
# Configurar variables antes de iniciar
npm run dev
```

| Variable | Valor esperado |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave `sb_publishable_…` |

Son configuración pública, no credenciales de administrador. Nunca usar
`service_role`, `sb_secret_…` ni una contraseña en estas variables. El validador
web no acepta claves legacy. No versionar `.env.local`.

## Rutas y responsabilidad

| Ruta | Comportamiento |
| --- | --- |
| `/login` | Email/contraseña con Server Action; verifica identidad y perfil |
| `/` | Summary: filtros de mes/persona, indicadores, gráfica y colaboradores |
| `/activity` | Actuaciones día/mes, búsqueda literal por bicicleta, validez, páginas de 25 |
| `/activity/detail?id=…&asOf=…` | Endpoint protegido para el panel de detalle; fotos firmadas |
| `/access-denied` | Acceso no autorizado para el perfil actual |

Solo `supervisor` con `is_active=true` entra al dashboard. Manager utiliza ese
perfil técnico. La web no crea/promueve usuarios. Sesión mediante cookies
HttpOnly, SameSite=Lax y Secure en producción; cierre de sesión de alcance local
 a la sesión web. El móvil conserva su sesión independiente.

## Cómo se mantiene

Las páginas de servidor verifican acceso, validan filtros y llaman a lectores
tipados. PostgreSQL decide autorización y cómputos. Los componentes cliente
manejan filtros, idioma, desplegables y detalle; no reciben una clave privilegiada.
Los filtros viven en la URL. Los errores no se convierten en ceros.

Hasta 760 px se utiliza menú desplegable, métricas 2 × 2 y filas expandibles.
Escritorio conserva tabla y navegación lateral. Los mismos datos alimentan ambos
formatos; [guía responsive](../docs/web-mobile-responsive.md).

## Comprobaciones

```bash
npm test
npm run lint
npm run typecheck
npm run build
# Solo para servir la compilación ya generada
npm run start
```

La preparación del PR #4 pasó 218 pruebas web. Es un checkpoint fechado,
no un contador permanente. CI vuelve a comprobar el commit de cada PR.
Una build sin configuración puede compilar; eso no prueba acceso a Supabase.

## Producción

Vercel: directorio raíz `web`, rama de producción `main`, las dos variables
en Production y también en Preview para revisar ramas. Cambiar código requiere
un despliegue del nuevo commit; redeploy de uno antiguo repite su versión.
[Procedimiento y diagnóstico](../docs/deployment.md).

La web aún no ofrece callback de invitación, set-password ni recuperación.
No cambiar `mobyops://auth/callback` para resolver esa limitación: pertenece al
flujo móvil. [Arquitectura](../docs/architecture.md) ·
[Seguridad](../docs/security.md) · [Desarrollo](../docs/development.md).
