# Navegación operativa — 23/09/2026

Decisión aprobada por Jersson: tres pestañas inferiores, Home/Inicio,
Tasks/Actuaciones y Profile/Perfil. Home abre directamente el formulario;
se elimina el paso intermedio «Nueva Public Order».

## Implementación

- Expo Router Tabs (JavaScript), con las dependencias existentes.
- `app/(operations)/_layout.tsx` aplica el control de sesión y perfil a las
  tres rutas, incluidas las entradas directas por URL.
- La ruta `/` sigue siendo la entrada de la app. Las rutas de invitación y
  contraseña permanecen fuera del grupo operativo y conservan sus URLs.
- Home mantiene el estado local del formulario entre pestañas. Se limpia
  al descartar explícitamente o desmontarse el área operativa al cerrar sesión.
- Descartar requiere confirmación. El formulario ya no intercepta el botón
  Atrás de Android: desde otra pestaña, el navegador vuelve a Home.
- Profile conserva el logout local, bloqueo de doble pulsación y reintento.
  Tras logout correcto la ruta vuelve a `/`.
- Tasks y los detalles del perfil son provisionales. No presentan datos ni
  contadores ficticios. La consulta real se implementará por separado.

## Reglas vigentes de Public Order

Un registro válido requiere ID de bicicleta, al menos una de las tres
acciones y evidencia de antes y después (mínimo dos fotografías).
No se registra un resultado `unable_to_complete`. Sin confirmación del
servidor, un borrador no cuenta como actuación. No hay tabla de flota;
el identificador externo se almacena en la actuación.

## Límites y siguiente incremento

El borrador permanece en memoria, no sobrevive a terminar la aplicación.
El cierre de sesión lo descarta. Cámara, WebP, GPS y envío aún no están
conectados al formulario. Al añadir cámara deberá desactivarse cuando Home
pierda el foco, aunque su estado de formulario permanezca montado.

El perfil activo se comprueba al montar el área operativa; la revocación
posterior sigue dependiendo de las políticas del servidor para el acceso
real a datos y fotografías. Esta navegación no reemplaza RLS.

## Validación

Pruebas de navegación con Expo Router real y sesión/backend simulados:
entrada directa al formulario, persistencia entre pestañas, logout y
reintento, bloqueo de rutas directas, traducción ES/EN y limpieza de
borrador entre sesiones. Comprobaciones de tipos y lint.

Pendiente comprobar en Android: pestañas, teclado, botón Atrás, zonas
seguras y recorrido de logout con sesión real.
