# Barra lateral — cierre de sesión

Fecha: 11 de octubre de 2026.

Jersson solicita añadir el icono de salida y un rojo mate. LogoutControl
incorpora un SVG de puerta/flecha con currentColor y trazo de 1.8, coherente
con los iconos de navegación. Icono decorativo, sin foco ni nombre duplicado.
Icono y texto usan #D28A86 sobre #141414: contraste normal 6.77:1.
Hover con fondo rojo al 8 %, foco visible existente y altura mínima de 44 px.

No cambia la acción de servidor, el alcance de signOut, las traducciones,
los errores ni el bloqueo mientras se procesa la salida. Sin dependencias.
Ajuste visual reversible protegido por los controles existentes de navegación
y cierre de sesión; no se añaden pruebas que reflejen únicamente los estilos.

Validación: suite web, lint, typecheck y build. Revisión visual en el
navegador de Jersson pendiente antes de commit.
