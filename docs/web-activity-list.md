# MOBY Ops — Actividad real: cabecera, controles y listado

Fecha: 11 de octubre de 2026. Base reportada por Jersson: SQL validado, commit `5a3def0`.

## Alcance y estado

Implementado y validado automáticamente; revisión visual y funcional local pendiente.
Vista protegida de consulta que utiliza `read_team_activity` con sesión por petición.
Este bloque construye cabecera, fecha actual de Dublín, controles y tabla paginada.
El panel lateral de detalle y las fotos privadas serán la siguiente vertical.
No contiene filas ficticias ni botones de detalle provisionales.

## Interfaz y comportamiento

Referencia: `docs/design/web/activity-approved.png`. Archivo/Inter, paleta MOBY,
controles blancos redondeados, Actualizar verde, tabla blanca, badges de validez.
Comparte el desplegable del resumen: se abre desde todo el control y la flecha,
se cierra con Escape/clic exterior y devuelve foco según la interacción existente.

- Abre en Hoy, todos los colaboradores y todas las actuaciones, más recientes primero.
- Búsqueda literal por ID mediante Enter o el icono Buscar; vacía retira la búsqueda.
  Validación genérica, sin enseñar el formato de un ID operativo.
- Colaborador, día/mes y validez se mantienen en URL. Cambiar un filtro reinicia
  página y corte; una búsqueda aún sin enviar no altera otros filtros.
- Calendario propio con días y meses, selección verde MOBY y sin fechas futuras.
  Meses reutilizan el componente del resumen. Botones de días accesibles con Tab/Enter,
  selector día/mes, navegación de meses y acceso a Hoy. No calendario nativo del sistema.
- Página de 25 registros, total de todo el resultado filtrado. Al paginar conserva
  el instante `as_of` recibido de SQL. Actualizar inicia una nueva lectura desde página 1.
- Hora de Dublín; en periodos mensuales también se muestra la fecha de cada actuación.
- Solo aparecen los iconos de acciones realmente realizadas, con nombre accesible.
  Kickstand reutiliza el SVG propio aprobado. No se modifica su tamaño en Resumen.
- Inválidas se conservan como registros, con X y badge rosa; válidas con check verde.
  Total del listado incluye ambas, manteniendo los contadores del servidor separados.
- Error, resultado vacío y página sin filas son estados distintos, con reintento/reset.
  Si falla el selector, no se presenta una falsa lista vacía; las filas válidas permanecen.
- ES/EN comparte el selector. Tabla con encabezados semánticos y scroll horizontal
  por teclado en anchos estrechos; todos los controles operables por teclado.
- Sin breadcrumb, DEMO, hora de actualización ni navegación Equipo.

## Seguridad y decisiones técnicas

Página Server Component verifica supervisor activo antes de parsear URL o llamar RPC.
Lee listado y colaboradores en paralelo, sin cache compartida ni service_role.
Denegación durante cualquiera de las consultas redirige a acceso denegado.

Filtros repetidos, fechas inválidas/futuras, búsqueda no permitida, offset no múltiplo
válido y cutoff ausente/futuro se rechazan antes de consultar. La autoridad sigue en SQL.

El servicio valida periodo/filtros devueltos, counts seguros, `total=valid+invalid`,
longitud de página y `has_more`, UUID únicos, selección, checks booleanos, fecha de
Dublín y corte, validez y referencia de duplicado, orden reciente. Campos adicionales
se descartan; no se envían notas, ubicación ni rutas de fotos al cliente del listado.
Límite de red 10 segundos, error genérico sin mensajes internos del proveedor.

Sin nuevas dependencias, SQL ni cambios de RLS/Storage. El corte es temporal, no un
snapshot MVCC: ver limitación administrativa documentada en `web-activity-data.md`.
El siguiente bloque deberá verificar esquema remoto y políticas de evidencia antes de
conectar las fotografías; no inferir permisos por tener una ruta almacenada.

## Verificación

Pruebas de filtros (incluido día real y cambio horario), DTO/RPC, duplicado y cutoff,
controles de búsqueda/persona/fecha/validez, calendario, paginación, traducción,
vacío/error y rechazo de acceso directo/revocado. TDD con pruebas de comportamiento
rojas por implementación ausente, seguido por implementación y comprobación completa.

Preparación: 184 pruebas web pasan; ESLint, TypeScript y build de producción pasan.
No se ha realizado inspección del navegador ni consulta Supabase desde este entorno.
Validación local pendiente antes de commit:

1. Hoy real y selección de persona; día histórico y mes; búsqueda por ID.
2. Válidas/Inválidas/Todas y acciones mostradas con iconos correctos.
3. Más de 25 registros: Anterior/Siguiente conservan los filtros y el corte.
4. Actualizar tras una actuación nueva; pasar de página final a primera.
5. ES/EN, teclado y ancho estrecho; contraste y fidelidad del bloque sin detalle.
6. Confirmar que Resumen y el ajuste de tamaño de kickstand conservan su aspecto.
