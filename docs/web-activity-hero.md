# Activity — hero de trazabilidad y selector de idioma

Fecha: 11 de octubre de 2026.

## Decisión y alcance

Jersson elige la opción 2, Huella de la operación, con estas correcciones:
reutilizar el icono de bicicleta existente, conservar el texto actual y cambiar
los círculos grises por verde claro MOBY. El selector se conserva en Summary
y se retira de Activity. Se entregan ambos cambios en una única integración.

## Implementación

ActivityTrail contiene una ilustración SVG decorativa: ruta verde #D1FF00,
círculos #F3F9DB mediante el token selected y puntos discretos. Reutiliza
/icons/bicycle-outline.svg y /icons/lock-closed-outline.svg sin modificarlos.
Ubicación y cámara son trazos decorativos locales. No representa rutas reales,
una secuencia obligatoria ni datos del equipo. Oculta a lectores de pantalla,
sin foco, animación ni interacción.

DashboardShell conserva el título, activityTagline ES/EN y la fecha recibida
del servidor en Europe/Dublin. No se adopta el copy del mockup generado.
La cabecera coloca texto a la izquierda e ilustración a la derecha; por debajo
de 1100 px pasa a una columna. El SVG mantiene su proporción sin recortes.
La barra de idioma solo se renderiza en Summary; Activity usa el proveedor
existente. No se reserva una barra vacía en Activity.

Sin dependencias, datos, migraciones ni cambios de permisos. Summary conserva
su ilustración y controles. El parche sustituye el parche independiente de
idioma; se aplica sobre la versión con zoom/mapa, antes del cambio de idioma.

## Validación

206 pruebas web, ESLint, TypeScript y build de producción. Comprobación de
aplicación limpia del parche sobre los archivos previos y diff sin espacios
finales. Pruebas cubren idioma conservado al pasar de Summary a Activity,
ausencia del selector en Activity, copy vigente y fecha cruzando medianoche
de Dublín.

Revisión visual en navegador pendiente: este entorno no dispone del binario
de Chromium. Comprobar desktop y móvil, icono original, círculos verde claro,
ausencia de solapamientos y conservación de los filtros/listado/detalle.

## Cierre visual — 11 de octubre de 2026

Jersson aprueba la opción 1: el texto existente «Cada actuación, con su
evidencia.» pasa a ser el único h1 del hero. En inglés conserva «Every action,
with its evidence.». Se retira el título genérico de la cabecera y el párrafo
duplicado; Actividad sigue identificando la vista en la navegación.

Título de 30–40 px según el viewport, líneas equilibradas y fecha debajo.
La ruta, los iconos originales, los círculos verde claro y el comportamiento
del selector de idioma se conservan. No hay cambios de datos ni permisos.

Las tres pruebas ajustadas fallaron por el título anterior antes de implementar
el cambio. Suite web completa (206 pruebas), lint, typecheck y build aprobados.
La propuesta visual está aprobada; queda la revisión del resultado aplicado
en el navegador de Jersson antes del commit final de la vista.
