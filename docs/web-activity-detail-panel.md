# Panel de detalle de Actividad

Fecha: 2026-10-11. Panel inicial validado manualmente por Jersson; correcciones de zoom/mapa pendientes de revisión local.

## Comportamiento

El ID de la bicicleta y la flecha de cada fila abren el panel lateral derecho.
La fila seleccionada adopta el verde suave del producto. El panel conserva los
filtros y la página; no navega a otra vista ni altera la validez de una actuación.
Muestra identidad, estado, colaborador, fecha/hora de Dublín, evidencias antes y
después, acciones realmente realizadas, observaciones y coordenadas registradas.
No inventa etiquetas descriptivas de fotos ni muestra fotografías de ejemplo.
Los archivos múltiples de una fase se conservan, y una fase sin evidencia se
identifica claramente. Los iconos proceden del sistema existente, incluida la pata.

Las fotografías se amplían completas, sin recorte, con Escape o botón para volver.
El visor permite zoom 100–400 % en pasos de 50 %, restablecer al 100 % y recorrer
la imagen ampliada con scroll, gesto táctil o arrastre con el ratón. También admite
las teclas +, − y 0, y una región enfocable para desplazamiento con teclado.
La miniatura usa recorte cuadrado acorde al mockup. Escape cierra después el detalle;
al cerrar se devuelve el foco al botón que lo abrió. El panel mantiene el teclado
dentro del diálogo y bloquea la lista subyacente. En móvil ocupa todo el ancho.
La lengua ES/EN procede del proveedor existente. No incorpora nuevas dependencias.

## Acceso y fallos

GET `/activity/detail?id=<uuid>&asOf=<corte>` crea un cliente por petición,
comprueba sesión/perfil activo supervisor antes de leer datos y aplica respuestas
privadas sin caché. No acepta rutas de fotografías ni roles del cliente.
El RPC ya aprobado decide la autorización y la validez. Se valida su respuesta,
incluidos coordenadas, UUID, fecha/corte, acciones y rutas de las evidencias.
Solo se firman rutas registradas validadas. El navegador recibe URLs temporales,
no el campo storage_path ni credenciales administrativas.

Las firmas duran 300 segundos; al expirar se retiran de la interfaz, se cierra
la ampliación y se permite renovar. El servidor comparte una señal de cancelación
con las peticiones Supabase (límite 15 s); la interfaz limita su espera a 20 s,
cancela al desmontarse e ignora respuestas tardías. El proxy de sesión previo
mantiene su configuración actual. Si una foto no carga, se conserva el detalle
con error recuperable. Se ha retirado el botón permanente de actualizar junto
a las evidencias: Reintentar solo aparece si una foto falla o caduca. Falta de actuación y falta de foto son estados distintos.
Las observaciones se renderizan como texto React, nunca HTML ni descripción AI.

Una URL ya emitida puede utilizarse hasta caducar aunque se revoque un perfil.
Esta limitación de enlaces firmados queda documentada en el contrato de datos.
No hay rutas públicas de fotografía, persistencia de enlaces ni service_role.

## Evidencia de calidad

Se añadieron 15 pruebas (datos, ruta HTTP y componente), sobre las 184 existentes.
La prueba inicial del lector falló por no devolver detalle ni autorización;
la implementación satisfizo esos casos. Se verifican rutas malformadas sin firma,
denegación, datos mínimos, fotos reales, texto seguro, fecha Dublín, ampliación,
Escape/foco, respuesta tardía, error/reintento, caducidad y acceso HTTP sin caché.
Tests, lint, typecheck y build: ejecutados en el entorno de preparación.
El panel inicial fue validado funcionalmente por Jersson en local. Las correcciones
de zoom y apertura de mapas quedan pendientes de revisión manual.
La suite actual contiene 204 pruebas; los cinco casos añadidos cubren la retirada
del botón permanente, zoom/restablecimiento, límites, teclado y mapa.
El diseño se basa en activity-approved.png; no se afirma comparación visual exacta
sin la revisión local de Jersson.

## Comprobación local

1. Abrir una actuación válida e inválida mediante ID o flecha.
2. Verificar observaciones, ubicación, hora, acciones y fotos reales antes/después.
3. Ampliar ambas fotos y volver mediante Escape; cerrar y comprobar el foco.
4. Comprobar una actuación de otro colaborador, si existen evidencias del equipo.
5. Revisar sin fotos/sin notas y fallos de conexión o carga con Reintentar.
6. Esperar cinco minutos: las fotos caducan; Reintentar vuelve a pedir autorización.
7. Revisar ES/EN, ancho móvil y escritorio, y conservar filtros/paginación al cerrar.

La navegación desde Resumen hacia Actividad aún no se incluye en este bloque.

## Ubicación enlazada al mapa

La tarjeta de ubicación abre Google Maps en una pestaña nueva usando las coordenadas
numéricas originales (no las cadenas traducidas/redondeadas de la pantalla).
El enlace utiliza `api=1` y `query=latitud,longitud`, codificados con URLSearchParams.
No incorpora la URL de la fotografía ni el nombre del colaborador.
Se usa noreferrer/noopener y referrerPolicy no-referrer. No se consulta geocodificación
ni se inventa una dirección postal: se abre el punto registrado de la actuación.
Referencia revisada: https://developers.google.com/maps/documentation/urls/get-started

Comprobaciones adicionales locales: ampliar hasta 400 %, recorrer los extremos de
la fotografía, restablecer y abrir la tarjeta de ubicación para verificar el punto.
