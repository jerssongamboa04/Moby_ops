# EAS Update y estados de tareas

Decision aprobada el 30-09-2026: preparar la siguiente APK para actualizaciones
remotas compatibles y distinguir las actuaciones invalidas con una X roja.

## Interfaz

TaskMetrics usa close-circle-outline para invalidas y checkmark-circle-outline
para validas. Se aplica al conteo de Hoy, Mes y al resumen de cada dia.
Las tarjetas individuales usan close-circle rojo cuando counted es false y
checkmark-circle verde cuando es true. Se mantienen colores, tamaños y etiquetas
accesibles existentes. No cambia la regla del servidor ni los datos guardados.

## Configuracion

- expo-updates instalado con la version compatible seleccionada por Expo SDK 57.
- updates.url apunta al proyecto EAS existente.
- runtimeVersion usa fingerprint: una actualizacion solo se entrega a un runtime
  compatible. Un cambio nativo requiere nueva build; no forzar el runtime anterior.
- preview usa canal preview y entorno preview; production usa canal production
  y entorno production. No se copian valores de variables entre entornos.
- Se conserva el comportamiento de arranque predeterminado: la app puede abrir
  su bundle incluido/cacheado y descargar una actualizacion para otro arranque.
  No se fuerza una recarga mientras el usuario rellena un formulario.

## Primera APK habilitada

Desde feat/authentication actualizado:

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --runInBand
npx eas-cli@24.8.0 build --platform android --profile preview
```

Las variables EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
han de existir en EAS preview. Instalar el nuevo APK desde su nuevo enlace.
Las APK anteriores sin expo-updates no pueden recibir estas actualizaciones.

## Publicaciones posteriores (solo tras validar el cambio)

```bash
npx eas-cli@24.8.0 update --channel preview --environment preview --platform android --message "Describe el cambio validado"
```

Este comando publica a los dispositivos compatibles del canal preview, no solo
al telefono del desarrollador. Revisar el commit, ejecutar comprobaciones y
probar con Metro antes de publicar. Mantener --environment preview para que el
bundle use las mismas variables que la build. No publicar ahora una OTA solo
para repetir lo que ya incluye la nueva APK.

Tras una publicacion, abrir la app con conexion, dejar descargar la actualizacion
y cerrar/reabrir si es necesario (hasta dos aperturas). Validar el cambio en un
APK real, no darlo por desplegado por verlo solo con Metro. Si fingerprint cambia,
generar una nueva APK compatible. Antes de usar production, configurar y validar
sus variables de entorno por separado.

## Validacion pendiente en dispositivo

Comprobar X roja en totales de Hoy, Mes, filas por dia y tarjetas invalidas; check
verde en validas. Revisar arranque, login, envio y recuperacion de sesion. Probar
la recepcion de una futura OTA compatible antes de considerar EAS Update validado
extremo a extremo. La configuracion por si sola no acredita esa recepcion.

Fuentes: https://docs.expo.dev/eas-update/getting-started/ y
https://docs.expo.dev/eas-update/runtime-versions/.
