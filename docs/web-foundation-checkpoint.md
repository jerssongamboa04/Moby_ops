# MOBY Ops Web — checkpoint local del 5 de octubre de 2026

Responsable: Jersson Gamboa. Rama local: `feat/web-foundation`.
Base: `2a56103`; parche recuperado del commit `868abdc`.

## Alcance

Base Next.js en `web/`, con dependencias independientes, logos, mockups y documentación. Se conservan la app móvil en raíz y SQL en `supabase/`. Configuración de CI web y exclusiones en controles móviles. Página provisional; sin dashboard, autenticación web ni consultas operativas implementadas. Sin cambios remotos en Supabase ni despliegue Vercel.

## Evidencia aportada por Jersson

- Node 22.19.0 y npm 11.8.0; instalación web con `npm ci` completada.
- Web: lint, typecheck y build aprobados.
- Prueba manual de la build con `npm run start`: logo MOBY y mensaje provisional visibles.
- `npm audit --omit=dev` dentro de `web/`: cero vulnerabilidades reportadas. Este resultado no garantiza ausencia de vulnerabilidades desconocidas.
- Móvil: lint y typecheck aprobados; suite completa posterior aprobada, 30 suites y 177 tests.
- Primera ejecución móvil: timeout de 5 segundos en el primer test de `tasks-screen-test.tsx`. Suite aislada posterior: 9/9 tests; test afectado en 475 ms. Suite completa posterior: 177/177 en 29.417 s. Causa no confirmada; sin cambiar timeout, mocks ni código para ocultar el fallo.
- `git diff --check` aprobado para cambios rastreados; diff de configuración revisado.
- Pendientes: revisión de todos los archivos preparados para commit, commit local, publicación de rama y comprobación de GitHub Actions. La validación de esta base no equivale a validar el dashboard o la app móvil en dispositivo.

## Aviso de seguridad y decisión temporal

`npm audit` web informa cinco paquetes afectados por GHSA-vfj7-8cjw-p6xm en la cadena `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. El aviso describe agotamiento de pila por patrones profundamente anidados. En el aviso consultado no se registra versión corregida. La cadena reportada pertenece a herramientas de desarrollo; audit de producción local no reporta avisos.

El 5 de octubre de 2026 Jersson autoriza continuar el desarrollo local con este aviso pendiente, sin degradar `eslint-config-next` de 16.3.8 a 14.2.35 ni ejecutar `npm audit fix --force`. El aviso sigue abierto, no se declara corregido y la excepción no se extiende a otros fallos ni a producción. Revisar una actualización o corrección compatible cuando esté disponible y antes de distribuir/desplegar; cambios de dependencias requieren diagnóstico, validación y autorización aplicables.

Aviso separado: npm informa que ESLint 9.39.5 ya no tiene soporte. Su actualización compatible sigue pendiente de revisión; no se confunde con la versión de `eslint-config-next`.

Referencia: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

## Próxima entrega

Cerrar documentación y revisión del contenido preparado; guardar la base como commit local. Después comenzar estructura visual y Resumen con datos ficticios siguiendo el plan de ejecución, revisando fuentes y decisiones antes de implementar.
