# MOBY Ops Web — decisiones aprobadas

Fecha: 2026-10-05. Responsable de producto: Jersson Gamboa.

## Producto

- Solo consulta para supervisor y manager activos, con idéntico acceso al equipo.
  Jersson utiliza supervisor. Alta por invitación; acceso email/contraseña.
- MFA aplazado explícitamente hasta disponer de más recursos. Sustituye el requisito
  anterior para esta primera versión; sin esa segunda barrera ante robo de contraseña.
- Navegación: Resumen y Actividad. Equipo eliminado.
- Resumen: bienvenida, gráfica de actuaciones válidas por mes, indicadores día/mes
  de atendidas, aseguradas, pata colocada, reposicionadas; inválidas aparte y por
  colaborador. Mes actual «En curso», sin comparación engañosa con meses cerrados.
- Actividad abre en Hoy, todos los colaboradores, más recientes primero; filtros
  de colaborador, fechas y validez, búsqueda por ID, tabla paginada y panel lateral.
- Detalle: antes/después ampliables, acciones, observaciones, ubicación puntual y
  motivo concreto de duplicidad. Acceso temporal a fotos privadas. No rastreo continuo.
- Resumen enlaza a actividad conservando periodo/colaborador y filtro de inválidas.
- Carga al entrar/cambiar filtros/Actualizar; hora visible, filtros en URL, sin realtime.
- Sin tareas sin terminar ni Unable to complete. Daños/reparaciones en otra app.
  Asignar tareas y gestionar cuentas desde web quedan fuera de esta versión.

## Regla existente

Se conservan todas las actuaciones. Cuenta la primera por colaborador, bicicleta y
fecha Europe/Dublin, ordenada por created_at, id. Las posteriores son inválidas por
duplicidad. Otro colaborador o día cuentan independientemente. No contar bicicletas
únicas ni sumar checks. Excluir checks de inválidas de los indicadores válidos.
Sin conversión manual inválida→válida. No hay tabla de flota; rechazos de formato
antes del envío no son actuaciones registradas.

Evidencia: supabase/migrations/read_own_tasks_day.sql, función read_own_tasks:
total = counted + repeated; el total válido es counted. Fecha autoritativa created_at
servidor, no performed_at del teléfono. submit_public_order.sql protege reintentos
por action_id. No persistir flag mutable sin problema demostrado.

La consulta actual es propia. El panel necesita autorización/consultas de equipo;
al ampliar el ranking incluir employee_id y clasificar antes de paginar o filtrar
validez. No asumir aplicadas las migraciones remotas por existir en el repositorio.

## ADR — arquitectura y organización

Un repositorio, móvil raíz y web/ independiente con package.json y lockfile propios;
SQL compartido en supabase/. Vercel despliega web/. Alternativas descartadas:
repositorio separado (coordinar cambios SQL/UI entre repositorios) y mover Expo a
apps/mobile con workspaces (cambios en EAS/Metro sin necesidad actual). Sin Turborepo
ni paquetes compartidos anticipados. Excluir web de lint, TS y Jest móviles.

Stack aprobado: Next.js App Router, React, TypeScript, Tailwind, Recharts, Supabase.
ES/EN con i18next/react-i18next. Base: Next 16.3.8, React 19.2.8, Tailwind 4,
lockfile independiente, Node 22/24. Instalar dependencias funcionales en su vertical.
Next verifica identidad/perfil/filtros, consulta con sesión del usuario; PostgreSQL
calcula y autoriza con RLS. Integración SSR prevista con cookies, verificación de
identidad y renovación oficial; sin service_role ni caché compartida autenticada.

## Referencias visuales

- [Resumen aprobado](design/web/summary-approved.png).
- [Actividad aprobada](design/web/activity-approved.png).

Capturas con datos/fotos ficticios. Ajustes acordados: retirar Equipo, sustituir llave
inglesa por icono de pata, utilizar SVG originales MOBY. Conservar ilustración exacta
Dublín, panel, paleta y jerarquía. No descripciones automáticas de fotografías.
Logos originales copiados a web/public/brand. Tipografía decidida el 5 de octubre:
Archivo 700/800 para títulos y cifras destacadas; Inter 400/500/600 para textos,
tablas y controles. Sustituye Neue Haas Grotesk Text tras aprobación de Jersson,
por disponibilidad en Google Fonts sin incorporar una licencia comercial.
Integración mediante next/font/google, variables CSS y recursos servidos por la
propia web; requiere acceso a Google Fonts al compilar. Fuente de sistema como
respaldo durante carga. Sin cambios de tipografía móvil ni nuevas dependencias.
Comprobar las fuentes realmente renderizadas antes de validar visualmente.
Extracción de ilustración para implementación visual pendiente.

## Estado y validación

Este checkpoint: base Next, tokens, página provisional sin datos operativos, controles
web lint/typecheck/build, CI independiente y exclusiones móviles. No es el dashboard
terminado. Sin login, consultas equipo ni fotografías conectadas todavía.
Pendiente: confirmar esquema Supabase real, manager/RLS, sesión/callback/recovery,
componentes de diseños, ES/EN, responsive y pruebas manuales. No modificar SQL remoto
sin presentar y aprobar migración concreta. No desplegado en Vercel.

Cada vertical aplicará TDD de comportamiento, pruebas negativas de autorización y SQL
para duplicados/fechas/DST; E2E para acceso/filtros/evidencias. La base de configuración
no incluye tests vacíos ni tests artificiales para indicadores aún no implementados.
CI mantiene tests/lint/typecheck móvil y añade lint/typecheck/build web.

Fuentes: docs/tasks-history.md; https://nextjs.org/docs/app/getting-started/installation;
https://supabase.com/docs/guides/auth/server-side/creating-a-client;
https://supabase.com/docs/guides/auth/server-side/advanced-guide;
https://vercel.com/docs/monorepos.

## Evidencia de este checkpoint

- Móvil: lint/typecheck aprobados; 30 suites, 177 tests aprobados.
- Web: lint/typecheck/build aprobados; arranque de producción en localhost y HTTP
  200 de página/logo comprobados. No validación visual completa ni Android manual.
- npm audit web con omit=dev: 0 vulnerabilidades reportadas.
- npm audit móvil: 63 avisos (11 moderados, 52 altos). Son del árbol existente;
  no se cambió el lockfile/dependencias móviles. Requieren diagnóstico antes de
  distribución operativa; no aplicar audit fix --force ni extender excepciones previas.
- Diff revisado y git diff --check aprobado. Supabase/Vercel no modificados.
