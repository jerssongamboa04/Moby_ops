# Diseño operativo — 23/09/2026

## Objetivo aprobado

Dar personalidad y jerarquía visual a MOBY Ops conservando el acceso directo
al formulario y las tres pestañas. Se parte de las fotografías reales del
Android aportadas por Jersson y la dirección de marca del documento del proyecto.

## Cambios

- Fondo claro suave, superficies blancas, espaciado coherente y títulos compactos.
- Cabecera común con nombre del producto en texto y pertenencia al equipo.
  No se recrea el logotipo oficial ni se incluye una fuente sin sus archivos.
- Home agrupa bicicleta, acciones y observaciones; selección con icono y
  marca además de color. Conserva el borrador y el descarte confirmado.
- Recordatorio de evidencia antes/después con contraste; todavía no hay
  captura de fotos ni botones de cámara que simulen funcionalidad.
- Navegación con indicador neón compacto alrededor del icono activo.
- Tasks incorpora una presentación y aviso explícito del historial pendiente;
  no muestra un recuento de cero ni actuaciones inventadas.
- Profile agrupa preferencias y sesión. El selector EN/ES utiliza el i18n
  existente. Cambia el idioma de la sesión de la app, sin escribir aún en
  profiles.preferred_locale ni persistir una nueva preferencia local.
- Logout pasa a una fila secundaria y explica que descarta el borrador.

## Validación y límites

Pruebas de navegación y formulario, incluido cambiar de idioma desde Profile
sin perder el borrador. Typescript y lint. La cámara, el envío, el historial
y los detalles reales del trabajador siguen pendientes.

Queda pendiente la revisión visual en Android (390 px aproximadamente y
texto ampliado): teclado, etiquetas largas, barra inferior y zonas seguras.
El intento de previsualización web en el entorno de trabajo quedó bloqueado
por el arranque de Expo y la ausencia del navegador de pruebas.

Los archivos de Neue Haas e Inter y el logotipo oficial aún no están
incluidos; se mantiene la tipografía del sistema con pesos y tamaños
explícitos hasta disponer de los recursos autorizados.
