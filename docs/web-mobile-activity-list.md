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

## Integración y validación

Integrado en PR #4 (`38496c2`). Estado local con apertura por actuación/periodo;
no se necesitan parches de tarjetas previos al trabajar sobre main actual.
TDD registrado por botón ausente; las pruebas cubren abrir/cerrar, teclado,
controles relacionados, apertura independiente y cambio de periodo. Se conservan
pruebas de datos, tareas, validez y panel. Checkpoint conjunto: 218 pruebas web,
lint, TypeScript, build y CI correctos.

Revisión local comunicada por Jersson. Pruebas DOM no miden geometría; comprobar
regresiones en Safari/Chrome, ES/EN, tres tareas, inválidas y PC.
[Marco](web-mobile-responsive.md) · [Pruebas](testing.md).
