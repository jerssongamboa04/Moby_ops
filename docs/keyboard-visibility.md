# Visibilidad del formulario con teclado — 2026-09-25

## Evidencia y decisión

Jersson confirma el flujo y el rediseño editorial en Android, incluido el aviso
temporal de éxito. Sus capturas muestran que el teclado tapa el campo activo en
login y observaciones. Ambas pantallas dejaban `behavior` sin definir en Android.

Se establece `height` en Android y se conserva `padding` en iOS. Es una corrección
mínima apoyada en el componente existente y sus ScrollView; no se añaden wrappers,
dependencias, offsets arbitrarios, temporizadores ni cambios nativos. No cambia
autenticación, almacenamiento de fotos, validación ni envío.

Alternativas: no cambiar por ahora el modo nativo de ventana (implicaría otra
compilación), ni introducir una librería de teclado sin verificar primero el
comportamiento del componente incluido en React Native.

Referencias:
- https://reactnative.dev/docs/keyboardavoidingview
- https://docs.expo.dev/guides/keyboard-handling/
- Implementación instalada: react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js.

## Validación

La prueba de contrato verifica la configuración en las dos plataformas; no
simula geometría nativa ni demuestra que el campo quede visible en un dispositivo.
La prueba roja válida detectó Android sin `height`, con iOS correcto.

Pendiente en Android: abrir correo y contraseña, alternar entre ellos con el
teclado abierto; escribir varias líneas en observaciones; desplazar el formulario;
cerrar y reabrir el teclado y comprobar que no quedan huecos o recortes. El campo
activo y el cursor deben poder verse y el contenido debe permanecer intacto.
Repetir con fuente ampliada y en iOS cuando haya dispositivo disponible.

Si el teclado sigue tapando el campo, comprobar redimensionamiento y scroll
en el dispositivo antes de ampliar la solución. No declarar resuelto solo por Jest.
