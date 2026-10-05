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
