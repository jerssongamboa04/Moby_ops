# Resumen: cuatro métricas reales

## Alcance

Tarjetas mensuales de bicicletas atendidas, aseguradas, pata colocada y
reposicionadas, con sus recuentos de hoy. Datos agregados del equipo obtenidos de
`read_team_summary_metrics`, ya aplicada y validada por Jersson en Supabase.
No nuevas migraciones, políticas, dependencias ni escrituras de datos.

La página verifica identidad y supervisor activo antes de consultar. El cliente
SSR usa la sesión de la petición y la clave publicable; no service_role. La función
SQL vuelve a autorizar y excluye duplicados de todas las métricas válidas. Las
repeticiones no se suman a las tarjetas. No sumar casillas para calcular atendidas.

## Lectura y estados

- Una llamada RPC sin parámetros: mes actual y hoy calculados en Europe/Dublin
  por PostgreSQL. No fechas del dispositivo ni datos ficticios.
- Solicitud sin caché compartida, límite de 10 segundos mediante AbortSignal.
- Validación de fechas, enteros no negativos y coherencia de recuentos antes de
  renderizar. Datos ausentes, malformados o errores muestran un aviso sin cifras.
- Respuesta vacía válida muestra ceros reales. Denegación muestra acceso rechazado.
- Actualizar/Reintentar refresca la ruta y vuelve a ejecutar autorización y lectura;
  deshabilita el botón mientras la transición está pendiente. Sin realtime ni polling.
- Hora y fecha de actualización vienen de generated_at y se presentan en Dublín.
- Cambio ES/EN traduce títulos, etiquetas, cifras y fechas.

## Diseño e iconos

Referencia: docs/design/web/summary-approved.png, bloque Actividad del mes.
Cuatro tarjetas blancas, círculos verde suave, cifras Archivo 800 y etiquetas
Inter, valores de hoy secundarios; dos columnas y una en pantallas estrechas.
Sin gráfica ni tabla ficticias: esos bloques se construirán a continuación.
Este bloque aparece debajo del saludo hasta incorporar la gráfica superior.
La revisión visual de todo el Resumen aún está pendiente; no se declara idéntica
la vista completa en este checkpoint.

Los SVG provienen de los trazados exactos de Ionicons.ttf y su glyphmap instalados
en @expo/vector-icons de la app móvil. Bicicleta y pata: bicycle-outline;
asegurada: lock-closed-outline; reposicionada: move-outline. Es la misma asociación
que src/features/operations/screens/tasks-screen.tsx. Refresh: refresh-outline.
No se carga React Native ni otra biblioteca de iconos en web. Aviso MIT conservado
en web/public/icons/LICENSE.txt (https://github.com/ionic-team/ionicons/blob/main/LICENSE).

## Validación

55 pruebas aprobadas en 8 archivos, lint, typecheck y build aprobados localmente.
Pruebas de lectura: totales independientes, ceros, datos malformados, denegación,
fallos de red y ausencia de cifras sustitutas. Pruebas de pantalla: cuatro tarjetas,
valores mensuales/hoy, zona Dublín, ES/EN, ceros y reintento. Pruebas existentes
comprueban que un visitante anónimo no llega a consultar la función RPC.
Los tests usan fixtures únicamente en archivos de prueba; producción consulta RPC.

Pendiente en el equipo de Jersson: aplicar parche, repetir controles, entrar como
supervisor y contrastar valores con registros reales. Verificar Actualizar tras
registrar una actuación móvil, idioma e iconos, y captura a ancho de escritorio
para comparar las tarjetas con el mockup. No credenciales remotas disponibles en
el entorno de desarrollo del parche; no se afirma una prueba real contra Supabase.
