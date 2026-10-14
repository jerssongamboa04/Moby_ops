# Activity móvil: lista desplegable de actuaciones

Fecha: 14 de octubre de 2026. Opción 2 validada visualmente por Jersson.

Hasta 760 px la misma tabla presenta filas compactas separadas por líneas,
con fondo blanco uniforme. ID, colaborador, fecha/hora de Dublín y validez
permanecen visibles. La flecha de 44 px despliega tareas realizadas y Ver detalle.
Todas las filas comienzan plegadas; pueden abrirse varias a la vez.

Solo las acciones realizadas muestran chips con iconos originales y etiquetas
cortas ES/EN. Ver detalle abre el panel existente; el ID también mantiene su
acceso directo al detalle. No se añade el prefijo bike al identificador.

Una representación, datos y consultas existentes. Cabeceras de tabla ocultas
visualmente en móvil; roles y scope conservan semántica. CSS retira las celdas
plegadas de la presentación y el árbol accesible solo en móvil. Botón nativo
con aria-expanded y aria-controls para las celdas de tareas y acceso al detalle.
Enter/Espacio funcionan mediante comportamiento del botón. Rotación y aparición
breve de 180 ms, desactivadas con prefers-reduced-motion. Apertura local por ID
y periodo; un periodo distinto se muestra plegado, traducir no reinicia apertura.

Escritorio conserva todas las columnas y acciones visibles, sin desplegables.
Filtros, búsqueda, orden, día/mes, as_of y paginación de 25 filas no cambian.
Nombres, fechas y chips pueden envolver texto; no se truncan campos ni se
reduce la tabla a columnas parciales. Inválidas siguen con X y etiqueta roja.
No cambia Supabase, datos, almacenamiento, autenticación o dependencias.

TDD: prueba roja por botón ausente; verde con abrir/cerrar, teclado, controles
relacionados, apertura independiente y cambio de periodo. Se mantienen pruebas
de datos mensuales, tres acciones, estado y apertura del detalle. Suite completa,
lint, TypeScript y build se ejecutan. QA visual pendiente en Safari/Chrome:
320, 390 y 430 px, ES/EN, tres tareas, inválidas, nombres largos, detalle y PC.
Pruebas DOM no comprueban geometría de CSS.

Integración: este parche final se aplica sobre Summary móvil terminado, antes
del parche provisional de tarjetas de Activity. Sustituye aquel diseño pendiente.
Si se aplicó el provisional, revertir únicamente ese parche antes de aplicar el
final. No afecta a los ajustes de Summary. Misma rama fix/web-mobile-responsive.
