# Login — Cada acción mueve Dublín

## Decisión — 2026-09-28

Jersson aprueba el mockup editorial con skyline de Dublín, ruta verde, selector
de idioma suave y botón oscuro con flecha verde. Solicita eliminar la frase
«Entra y pon tu jornada en marcha». El placeholder es Email en ES/EN.

Se implementa el logo vectorial original en oscuro con O verde (paths intactos),
OPS debajo y un SVG decorativo local con puente, cúpula, Spire y ruta verde.
La ilustración adapta el mockup a trazos vectoriales; no es una captura del diseño
generado. Expo Image ya existente muestra ambos SVG sin nuevas dependencias.

Textos: «TU CIUDAD. TU IMPACTO.» y «Cada acción mueve Dublín.» /
«YOUR CITY. YOUR IMPACT.» y «Every action moves Dublin.». No aparece subtítulo.
El formulario tiene título, etiquetas visibles para ambos campos, ojo de
contraseña, errores y botón de envío con estado deshabilitado/ocupado.

Se mantiene el flujo de sesión y la protección contra doble envío. Se mantiene
KeyboardAvoidingView con height en Android/padding en iOS, ScrollView y taps
con teclado. La ilustración pasa de 130 a 90 puntos en pantallas de menos de
740 puntos de alto o fuente ampliada; el título reduce tamaño en ancho <370.
El contenido está limitado a 520 puntos para tablet y permite scroll.

## Validación y pendientes

29 pruebas de navegación/login/configuración de teclado pasan, junto con
TypeScript y lint. Pruebas ES/EN actualizadas y verifican placeholder Email.
SVG renderizado e inspeccionado. El mockup no sustituye prueba visual nativa.

Pendiente en Android: revisar ES/EN, pantalla pequeña/fuente ampliada, teclado
sobre email y contraseña, alternar visibilidad, credenciales incorrectas y
login correcto. No requiere SQL ni nueva APK de desarrollo.

Limitación preexistente: «¿Olvidaste tu contraseña?» sigue siendo un botón sin
acción conectada. El rediseño no implementa recuperación; debe abordarse antes
de dar por listo ese flujo para uso diario.

## Corrección de fidelidad — 2026-09-29

La revisión del usuario invalida la aprobación visual de la implementación anterior.
Se recupera el mockup «MOBY Ops: Dublín en movimiento.png» y se compara con el código:
el círculo se había recortado dentro de una franja baja, el subrayado usaba una
posición absoluta independiente de la palabra y el selector era demasiado alto.

Cambios de esta revisión:
- Fondo local del login blanco cálido #FAFAF8, sin cambiar los tokens globales.
- Una única composición vectorial para el círculo, la ruta y la ciudad. El círculo
  ocupa el lateral del hero; los edificios mantienen proporciones y trazos definidos.
- El subrayado se ajusta al ancho real de Dublín/Dublin dentro del titular.
- Selector con pista fina y cápsula visible de 30 puntos; área táctil de 44 puntos.
- Se elimina «Tu ciudad, tu impacto» y se muestra «Mantén Dublín en movimiento.» /
  «Keep Dublin moving.». Se recupera «Entra y pon tu jornada en marcha.» /
  «Sign in and get your day moving.».
- La ilustración no se reduce al aparecer el teclado; scroll y KeyboardAvoidingView
  siguen gestionando el espacio. Fuentes ampliadas pueden aumentar el alto del hero.
- Recuperación de contraseña ya está conectada (ver password-recovery.md); la
  limitación anterior de ese botón queda obsoleta.

Validación: 26 pruebas de navegación/login pasan; TypeScript y lint correctos.
SVG renderizado e inspeccionado. No se ha podido ejecutar captura del formulario
completo: el navegador de pruebas no estaba disponible y falló su descarga.
Pendiente comparar una captura nativa Android con el mockup, incluyendo ES/EN y
teclado. La ciudad es vectorial; no se declara una copia píxel a píxel de la imagen
raster generada. No requiere migración ni nuevas dependencias del proyecto.
