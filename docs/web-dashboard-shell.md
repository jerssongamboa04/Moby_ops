# MOBY Ops Web — estructura común, idiomas y pruebas

Fecha: 5 de octubre de 2026 (Atlantic/Canary). Responsable: Jersson Gamboa.

## Alcance y criterio de aceptación

Menú Resumen/Actividad, logos originales, encabezado, indicador de demostración y cambio ES/EN. Rutas reales `/` y `/activity`, con selección activa accesible. Menú lateral en escritorio y horizontal en pantallas pequeñas. Perfil y fecha fijos de demostración, claramente identificados; no son identidad ni datos del servidor.

La entrega sustituye la página provisional por un marco común con contenido central provisional. No incluye la ilustración de Dublín, métricas, gráfica, filtros ni evidencias. No se presenta como reproducción completa del mockup. No se simula un cierre de sesión ni se consulta Supabase. La revisión visual con Jersson sigue pendiente.

## Decisión y dependencias

Jersson autoriza el 5 de octubre las dependencias de idiomas y pruebas propuestas. Next.js documenta Vitest con React Testing Library para componentes síncronos y cliente. Se eligen versiones cuyo soporte declarado incluye Node 22.19.0; jsdom 30 se descarta porque requiere Node 22.22.2 o superior. Vitest 4.1.11 y plugin React 5.2.0 son compatibles entre sí. Sin cambios de dependencias móviles.

- Producción: i18next 26.4.2, react-i18next 17.0.15.
- Desarrollo: Vitest 4.1.11, @vitejs/plugin-react 5.2.0, jsdom 27.4.0, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.7.
- Lockfile propio; Node admitido explícitamente: `^22.12.0 || ^24.0.0`.

Cada proveedor crea su propia instancia de i18next; los componentes usan su contexto. Recursos ES/EN locales sin llamadas de traducción externas. El proveedor está en el layout compartido para conservar el idioma durante navegación; actualiza `html.lang`. No almacena sesión, credenciales ni permisos. No se añade persistencia de preferencias por anticipación.

El icono de navegación se implementa como SVG sencillo, sin dependencia adicional. El componente compartido tiene una única responsabilidad: estructura del panel. Las rutas delegan en él. Las métricas y consultas se añadirán en sus propias entregas cuando estén probadas.

## TDD y evidencia en el entorno del asistente

- Roja válida: cuatro pruebas ejecutadas contra la página anterior; fallan por ausencia de navegación y botones de idioma, sin fallos de sintaxis/imports.
- Verde: cinco pruebas de comportamiento aprobadas tras implementar; incluyen enlaces, selección activa, cambio ES/EN y `html.lang`, teclado, conservación del idioma al cambiar contenido de ruta e independencia de instancias.
- Sin mocks del router ni consultas simuladas a Supabase; la prueba de transición de contenido no equivale a una prueba E2E del navegador.
- Lint, typecheck y build aprobados. Rutas `/` y `/activity` generadas.
- Audit completo: los mismos cinco avisos altos de la cadena ESLint; sin nuevos avisos reportados. Audit de producción: cero vulnerabilidades reportadas. Se mantiene el seguimiento y la excepción local registrada en el checkpoint, sin ampliarla a producción.
- Caché Turbopack dañada de una ejecución anterior apartada para esta build; sin cambios de configuración o fuente por esa causa.
- Arranque de servidor aprobado con hostname local explícito. La inspección visual automatizada no se ejecutó: el navegador de Playwright no está instalado en este entorno. No se instaló ni añadió Playwright al proyecto.

Pendiente en el ordenador de Jersson: `npm ci`, tests/lint/typecheck/build, navegación real Resumen↔Actividad, cambio de idioma, uso de teclado y revisión visual en escritorio y pantalla estrecha. Guardar commit solo después de la revisión aplicable.

## Referencias

- https://nextjs.org/docs/app/guides/testing/vitest
- https://react.i18next.com/latest
- Documentación de Next instalada: `next/dist/docs/01-app/02-guides/testing/vitest.md`.
- Versiones, engines y peerDependencies consultados en npm antes de instalar.
