# Summary móvil: detalles desplegables por colaborador

Fecha: 13 de octubre de 2026. Opción 3 aprobada por Jersson.

Hasta 760 px, la lista muestra avatar, nombre completo, estado inactivo y total
válido de atendidas. Todos los colaboradores comienzan plegados. Tocar la
cabecera o activar su botón con Enter/Espacio abre cuatro métricas en una
rejilla de dos columnas: candados, pata puesta, reubicadas e inválidas.
Se pueden abrir varias personas; otra pulsación vuelve a plegar la elegida.
El total del equipo conserva todas las métricas visibles al final.

Un único conjunto de datos y una única tabla para móvil y escritorio. CSS
presenta las filas como tarjetas móviles; en PC las cinco métricas siguen
visibles y no hay botones de despliegue. Se conservan roles, scope y cabeceras
para tecnología asistiva. aria-expanded refleja el estado y aria-controls
referencia las cuatro celdas controladas. display:none retira las métricas
plegadas de la presentación y del árbol accesible únicamente en móvil.

Estado local de apertura por colaborador y mes; cambiar a un mes distinto lo
muestra plegado, y traducir no reinicia la selección. Sin nuevas consultas.
Los valores, ceros, orden y totales permanecen procedentes del servidor.
Inválidas no se suman a atendidas. No cambia Supabase, datos ni permisos.

Iconos originales: lock-closed-outline.svg, kickstand.svg, move-outline.svg.
Inválidas usa X en círculo. Etiquetas ES/EN; nombres largos y cifras pueden
envolver texto. Botón de cabecera de al menos 44 px. Rotación del chevron y
aparición de métricas en 180 ms, desactivadas con prefers-reduced-motion.

## Integración y validación

Integrado en PR #4 (`38496c2`); no requiere aplicar parches adicionales al clonar.
Pruebas de componente cubren abrir/cerrar, teclado, controles relacionados,
apertura independiente, cambio de mes y total fuera del despliegue. El checkpoint
conjunto responsive pasó 218 pruebas web y CI. La revisión local fue comunicada
por Jersson; no existe una matriz E2E que acredite cada navegador/anchura.

Revisar regresiones con nombres largos, cifras grandes, ES/EN, filas simultáneas
 y PC. [Marco responsive](web-mobile-responsive.md) · [Pruebas](testing.md).
