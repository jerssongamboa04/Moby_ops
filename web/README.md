# MOBY Ops Web

Base del panel Next.js. [Decisiones](../docs/web-platform.md).
Todavía sin autenticación ni datos reales; no es el dashboard terminado.

Desde web/, Node 22 o 24:

```bash
npm ci
npm run dev
```

Abrir http://localhost:3000. Controles: npm run lint, npm run typecheck, npm run build.
Los comandos de raíz son Expo; npm run web en raíz es Expo Web, no este panel.

Vercel: repositorio Moby_ops, Root Directory web, preset Next.js, instalación npm ci,
build npm run build. Sin export estático: acceso previsto necesita servidor.
Variables/redirects se definirán en la vertical de acceso. Nunca usar service_role.

## Estructura visual y pruebas

Resumen (`/`) y Actividad (`/activity`) comparten navegación y proveedor ES/EN.
La selección de idioma se conserva al navegar dentro de la sesión de página;
recargar comienza en español. Los contenidos y perfil son de demostración.
Esta entrega aún no tiene métricas, filtros, fotos ni autenticación web.

Desde `web/`, tras `npm ci`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm test` ejecuta Vitest una vez; `npm run test:watch` mantiene el modo de
observación. La CI web incluye los tests. Node admitido: 22 desde 22.12, o 24.
El componente del panel es cliente y se prueba con React Testing Library;
las futuras rutas asíncronas de servidor necesitarán pruebas de integración/E2E.
