# Dashboard móvil — menú desplegable y composición compacta

Fecha: 13 de octubre de 2026. Base: main después de la integración del PR #3,
con commit funcional 7bbb807. Se verificaron los componentes y estilos de GitHub
antes de editar; se conserva el tamaño local aprobado del icono kickstand.

## Decisión aprobada

Jersson elige la propuesta A: cabecera compacta con logo original y desplegable
suave ajustado a las pantallas. Resumen, Actividad, idioma y Cerrar sesión quedan
dentro del desplegable en móvil. El hero no incluye selector de idioma móvil.
El diseño de escritorio conserva barra lateral y selector en Summary.

Actualización aprobada: opción 3, tarjeta personal. El desplegable móvil reúne
avatar de iniciales, nombre y rol existentes en una tarjeta oscura; debajo,
ES/EN y Cerrar sesión comparten fila. Se elimina el rótulo visible Idioma,
conservando su nombre accesible. Se reutilizan perfil y salida de escritorio,
sin duplicar formularios ni datos. Nombres largos y errores pueden envolver
texto; la tarjeta conserva su altura dentro del scroll del desplegable.

## Implementación

- Breakpoint de 760 px, coherente con la estructura existente. Cabecera sticky
  con botón de 44 px y logo de 104 px. El menú flota bajo la cabecera, ajusta
  altura al viewport dinámico y safe area y permite scroll interno en horizontal
  o pantallas de poca altura. No desplaza el contenido al abrirse.
- Disclosure accesible con aria-expanded/aria-controls, navegación semántica
  y enlaces reales. Sin role=menu ni focus trap porque no es un diálogo modal.
- Una misma navegación para móvil y PC. useSyncExternalStore sincroniza el
  breakpoint con un snapshot de servidor estable para evitar discrepancias de
  hidratación. Cerrado en móvil: aria-hidden e inert bloquean acceso/foco.
- Cierra con el botón, al seleccionar sección, tocar fuera, mover foco fuera
  y con Escape (recupera foco en el botón). Idioma ES/EN modifica el proveedor
  existente y permanece seleccionado al cerrar. No se añade persistencia.
- Opacidad y desplazamiento de 180 ms; sin transición cuando se solicita
  prefers-reduced-motion. Conserva el logo e iconos y el rojo mate de salida.
- Heroes compactos: saludo/título 28 px, fecha 13 px, skyline proporcional más
  pequeño sin sustituirlo ni recortarlo. Ruta SVG de Activity contenida.
- Filtros de Summary: colaborador a todo el ancho, mes y Actualizar en otra
  fila. Popups con ancho y altura contenidos. Activity mantiene sus filtros
  en columna. Inputs móviles a 16 px.
- Gráfica: mismo cálculo y datos, SVG desktop de 900 unidades y SVG móvil de
  360 unidades con meses abreviados. No se escalan las etiquetas desktop a un
  tercio de su tamaño. Gradientes con IDs distintos por gráfico y variante.
  Ambos SVG son decorativos; la única tabla accesible conserva todos los meses
  completos, válidas e inválidas. Los totales siguen mostrando ambas categorías.
- Tarjetas más compactas; tablas conservan desplazamiento horizontal local y
  todas sus columnas. No se transforma el listado en tarjetas ni se elimina
  información. Detalle de fotos con controles de 44 px, márgenes/safe area y
  ubicación que puede envolver texto. Zoom/permisos/sign out sin cambios.

Sin dependencias, migraciones, cambios de Supabase, nuevos privilegios ni datos.
Referencias oficiales: WAI APG disclosure navigation y documentación local de
Next.js para client components.
https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/

## Validación

TDD: cuatro pruebas rojas por menú ausente/controles visibles indebidamente;
implementación y cinco pruebas verdes de navegación móvil y conservación de PC.
Una prueba adicional comprueba perfil, idioma y salida en la misma tarjeta,
sin el rótulo redundante. Suite completa: 212 pruebas. Lint, TypeScript y build pasan. Parche comprobado
sobre la base actual, manteniendo el tamaño del icono de la pata.

No se ha realizado QA visual en navegador desde este entorno: la descarga del
binario Chromium falló. La simulación de matchMedia comprueba interacción y
accesibilidad DOM, no mide la geometría real ni sustituye la prueba en Safari.

Validar antes del commit: iPhone/Safari y Android/Chrome en 320, 390 y 430 px,
orientación horizontal y teclado; menú corto, largo y cambio de idioma; filtros
sobre datos reales; gráfica y totales; tabla sin scroll horizontal de toda la
página; fotos, zoom y mapas. En PC a 1440 px comprobar fidelidad del diseño.
Mantener los avisos de errores, las inválidas y la totalidad de las columnas.

## Integración

Aplicar sobre la versión del hero y salida que ya está en main. Trabajar en una
rama de corrección, por ejemplo fix/web-mobile-responsive, tras revisar el estado
local y actualizar desde main. El parche no realiza commit, push ni despliegue.
Probar localmente, registrar validación manual y revisar el diff; entonces commit,
PR a main, CI y merge. Vercel desplegará el cambio de main según la integración
configurada. El despliegue actual sigue sin modificaciones desde este entorno.
