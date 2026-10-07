# Resumen: hero y bienvenida

## Decisión — 7 de octubre de 2026

Después de validar con Jersson las tarjetas con datos reales, el desarrollo visual
continúa de arriba hacia abajo: hero, controles, gráfica, tarjetas y tabla.
Este cambio aborda únicamente la bienvenida. Las tarjetas reales existentes se
conservan. La corrección del icono kickstand sigue pendiente para su bloque.

## Ilustración aprobada

El único original disponible del skyline web es el PNG de 1448 × 1086 registrado
en docs/design/web/summary-approved.png. Se comprobó que coincide byte por byte
con la referencia adjunta. El SVG móvil dublin-motion.svg es otro dibujo y no se usa.

La referencia se copia sin cambios a web/src/assets/summary-approved.png para
que la build web sea independiente de archivos externos a web/. SummaryHero
importa esta referencia como imagen estática y la presenta en un
viewport SVG: x=686, y=40, ancho=742, alto=175. Un clip superior derecho elimina
el selector de idioma capturado; el límite inferior acaba antes de los filtros.
No se dibuja otro skyline, no se cambia su color y no se aplica una generación
que pueda reinterpretar edificios. Los textos y datos del mockup no son visibles:
la bienvenida y la fecha son HTML real.

A 1448 px de ventana la ilustración mide 742 × 175, coincidiendo con los píxeles
de la referencia. En otros anchos se conserva la proporción y no se amplía por
encima del original. Por debajo de 1280 px pasa bajo el texto, sin solaparlo.
El saludo, la frase y la fecha mantienen las fuentes Archivo e Inter aprobadas.

Consecuencia: se descarga el PNG completo (aproximadamente 1,28 MB, con caché del
asset estático), aunque solo se muestra el dibujo. No es un SVG vectorial; es un
recorte de visualización del original raster dentro de SVG. La copia tiene los mismos bytes y conserva el dibujo; Git puede reutilizar
el mismo blob de la referencia. Si se entrega en el futuro el original
vectorial o un recurso separado de la ilustración, puede sustituirse conservando
estas coordenadas y sin cambiar la lógica del hero. El PNG de diseño continúa
siendo un asset público de referencia, sin datos de producción.

## Datos y comportamiento

- Nombre obtenido del perfil autorizado por Supabase; se saluda con el primer nombre.
- Fecha basada en generated_at del RPC y formateada en Europe/Dublin, no en la
  zona del navegador. Si falla la métrica, usa el instante de la petición del
  servidor: la bienvenida continúa disponible y las tarjetas conservan su error.
- Fecha y copy ES/EN reaccionan al selector existente. Sin otro estado global.
- El instante se transmite como prop: no hay diferencias de reloj al hidratar.
- Una recarga o Actualizar vuelve a obtener fecha y métricas. Sin polling nuevo.
- Ilustración decorativa oculta a tecnologías de asistencia; saludo h1 y fecha time.
- Actividad conserva su encabezado anterior. Sin cambios SQL, permisos o dependencias.

## Validación

Prueba roja: tres casos fallaron por no existir la fecha de bienvenida.
Pruebas nuevas: nombre real, ES/EN, fecha en Dublín cruzando medianoche de verano,
medianoche de invierno y conservación del contenido real y del encabezado Actividad.
59 pruebas web aprobadas, lint, typecheck y build aprobados en el entorno del parche.
La build conserva los bytes originales del PNG en su asset estático.
Aplicación del parche comprobada contra la base con tarjetas reales v2.

Pendiente: captura del navegador de Jersson para comprobar la composición final
frente a la referencia a 1448 px y comprobar móvil. No se declara aprobada la
vista completa ni la alineación manual hasta revisar esa captura. El entorno del
parche no dispone de navegador ejecutable; la descarga para QA no pudo completarse.

## Ajuste visual aprobado — 7 de octubre de 2026

Jersson confirma en la captura local que el hero aporta la presencia buscada.
Solicita retirar la ruta «Operaciones / Resumen» porque la selección del panel
lateral ya identifica la vista. Se elimina el breadcrumb superior del frame
compartido y sus estilos/textos sin uso. El selector ES/EN conserva la barra
y su altura; la bienvenida, fecha, ilustración y métricas no se desplazan.
