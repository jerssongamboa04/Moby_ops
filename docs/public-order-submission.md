# Fotos y envío de Public Order

## Aplicación

1. Aplicar el parche y ejecutar `npm install`.
2. En el SQL Editor de Supabase, ejecutar `supabase/migrations/submit_public_order.sql` completo. Requiere las migraciones anteriores de perfiles, actuaciones, formato de ID y las políticas del bucket privado `public-order-evidence`.
3. Ejecutar `supabase/tests/public_order_submit_access.sql`. Usa un perfil existente dentro de una transacción que termina con ROLLBACK; no conserva cambios en ese perfil.
4. Iniciar `npx expo start --dev-client` y abrir la APK de desarrollo que ya incorpora cámara, ubicación y manipulación de imágenes.

No se ha ejecutado esta migración contra tu proyecto remoto desde este parche.

## Experiencia

El logo original se muestra proporcionalmente dentro de la cabecera oscura. Se retira la franja MOBY OPS / equipo de calle. El icono del lanzador sigue siendo el configurado anteriormente.

El formulario requiere ID válido, al menos una acción y dos fotos tomadas con la cámara: antes y después. Repetir la foto anterior descarta la posterior para conservar el orden. Las fotos se convierten a WebP, calidad 0.8, lado mayor máximo de 1600 píxeles, sin ampliar originales pequeños; se rechazan archivos mayores de 5 MiB. Las miniaturas permiten revisar las fotos antes de confirmar el envío.

Al enviar se solicita ubicación en primer plano. El empleado revisa ID y acciones en una confirmación. Solo se muestra éxito tras recibir confirmación del servidor. Tras el éxito se limpia el formulario y sus archivos locales.

## Integridad

El servidor obtiene el empleado de `auth.uid()` y exige un perfil activo. Genera identificadores y rutas privadas de subida. La app sube ambas fotos y llama a una función que valida ID, acciones, ubicación, fechas, propietario, rutas y metadatos de los archivos. La función guarda la actuación, dos evidencias y el evento en una única transacción. No concede inserciones directas a las tablas.

Los reintentos de un envío conservan el mismo identificador y datos mientras la pantalla sigue montada. Una confirmación perdida se consulta antes de volver a subir. Durante ese estado se bloquea la edición para evitar cambiar el contenido de la misma solicitud.

## Límites actuales

El borrador y el estado del reintento viven en memoria: no constituyen una cola offline persistente. Mantener la app abierta hasta confirmar el envío. Cerrar sesión o terminar el proceso puede perder el borrador. Una subida interrumpida puede dejar archivos privados sin actuación; falta implementar limpieza programada a través de la API de Storage antes de distribución general. Nunca borrar solamente filas de `storage.objects`.

La validación de MIME comprueba metadatos de Storage; no es una inspección del contenido binario en el servidor. El listado diario de Tasks continúa pendiente.

## Verificación física

Probar permisos concedidos y denegados; tomar ambas fotos; revisar sus miniaturas; enviar y confirmar una actuación con dos evidencias y un evento. Comprobar también un fallo de red y su reintento sin duplicados. Las pruebas locales no sustituyen esta comprobación de cámara, GPS y Storage reales.
