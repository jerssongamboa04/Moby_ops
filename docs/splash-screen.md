# Pantalla de arranque MOBY

Decision aprobada el 30-09-2026: fondo neon #D1FF00 y logotipo completo oscuro centrado.

Implementacion: plugin nativo expo-splash-screen existente, sin nuevas dependencias ni retrasos artificiales. PNG transparente de 1200 px de ancho exportado con Inkscape desde assets/brand/moby-logo.svg; conserva trazos y color original #262626, incluido TM. Fondo identico en modo claro y oscuro.

Android: imageWidth 180 para mantener el logotipo horizontal dentro del area segura del splash nativo. El sistema controla dimensiones y barras; no equivale a una imagen a pantalla completa ni garantiza el mismo porcentaje de ancho que el mockup de iPhone. iOS: imageWidth 240. No se dibujan barras, reloj ni lineas divisorias dentro del recurso.

EAS: el perfil preview selecciona explicitamente environment preview, donde deben existir EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. No se incluyen valores en este paquete. Este cambio visual no diagnostica ni corrige por si mismo otros errores de arranque.

Validacion: recurso renderizado y configuracion revisada; pendiente generar APK e instalar en Android real. Cerrar completamente y abrir en modo claro/oscuro, comprobar MOBY completo, transicion al login y conexion correcta. Expo Go y development builds no reproducen fielmente el splash de release. Los 177 tests anteriores corresponden al estado previo; no equivalen a probar esta build.

Fuentes: https://docs.expo.dev/versions/latest/sdk/splash-screen/ y https://developer.android.com/develop/ui/views/launch/splash-screen
