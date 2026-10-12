# Profile — tarjetas independientes

## Decisión — 2026-09-27

Jersson aprueba la propuesta 2. Se implementa el encabezado de Home/Tasks:
fondo #262626, logo SVG original 166:30, título verde MOBY, lema gris y línea
verde. El cuerpo claro se superpone con esquinas redondeadas.

Preferencias y Cuenta se presentan en tarjetas blancas independientes con borde
sutil. Cada tarjeta tiene icono sobre verde tenue. Idioma conserva los botones
English/Español y la selección accesible. Cuenta conserva cierre de sesión,
protección contra doble pulsación, estado ocupado, error y reintento; el botón
es neutro con borde y la nota sobre el borrador sigue visible.

No se añaden datos de usuario, funciones, dependencias o migraciones. La barra
inferior permanece gestionada por la navegación existente. Los títulos pueden
crecer y la pantalla tiene scroll para dispositivos pequeños/fuente ampliada.

## Validación

Ejecutar pruebas de navegación (index-test), TypeScript y lint.
La suite cubre cambio de idioma desde Profile conservando borrador, cierre de
sesión, error/reintento y limpieza de borrador tras cerrar sesión.
Pendiente validación visual en Android en ES/EN y con fuente ampliada.
