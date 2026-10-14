# Dashboard móvil: marco y decisiones responsive

Estado integrado por PR #4 (`a8b8037` → `38496c2`), 14 de octubre de 2026.
Esta es la guía actual del conjunto; cada bloque tiene su contrato específico.

## Problema y resultado

La navegación y tablas de escritorio ocupaban demasiado alto/ancho en teléfono.
Se eligió adaptar lectura y jerarquía manteniendo datos, filtros y autorización.
El menú compacto permite que el contenido empiece antes; cuadrícula y desplegables
alternan densidad visual sin perder cifras o acciones.

## Marco y navegación

Breakpoint 760 px coherente con el marco existente. Header sticky con logo
original de 104 px y botón de 44 px. Disclosure anclado bajo la cabecera, opacidad
 y desplazamiento de 180 ms, con altura limitada por viewport/safe area y scroll
interno. Reduced motion elimina transición. No desplaza el hero al abrirse.

Resumen y Actividad arriba; tarjeta personal con iniciales/nombre/rol existentes,
ES/EN y salida en rojo mate debajo. Se elimina el rótulo visible Idioma, no su
nombre accesible. Selector fuera del hero en móvil, dentro de Summary en PC.

Una navegación compartida. useSyncExternalStore escucha matchMedia con snapshot
servidor estable. aria-expanded/controls y botón nativo; cerrado tiene inert y
aria-hidden. No role=menu ni focus trap: es navegación disclosure, no diálogo.
Cierra con botón, enlace, Escape, toque o foco fuera; Escape devuelve foco al botón.
Idioma utiliza el proveedor existente, sin persistencia nueva añadida.

## Composición de las vistas

| Bloque | Adaptación móvil | Lectura detallada |
| --- | --- | --- |
| Hero | Título 28 px, fecha 13 px, ilustración proporcional | Componentes existentes |
| Filtros Summary | Persona a todo ancho; mes/Actualizar comparten fila | Filtros en URL |
| Gráfica | SVG de 360 unidades, meses cortos, totales válidas/inválidas | Tabla accesible única |
| Métricas | 2 × 2, blanco uniforme; Hoy en pie | [Cuadrícula](web-mobile-metrics-grid.md) |
| Colaboradores | Identidad/atendidas visibles, cuatro métricas desplegables | [Colaboradores](web-mobile-collaborators.md) |
| Activity | Identidad/fecha/validez visibles; tareas/detalle desplegables | [Actuaciones](web-mobile-activity-list.md) |
| Evidencia | Márgenes/safe area, controles de 44 px, herramientas que envuelven | Panel y zoom existentes |

No se conservan las columnas fuera de pantalla como solución móvil. Las tablas
usan roles y cabeceras mientras CSS adapta filas. En escritorio todas las
métricas/acciones siguen visibles, sin botones de desplegar. No se duplica la
consulta ni se añaden reglas de negocio para elegir tamaño de pantalla.

## Qué se verificó y qué falta medir

PR #4 pasó CI y las 218 pruebas web del checkpoint; Jersson revisó localmente y
dio por terminadas las vistas. Las pruebas DOM cubren interacción, no geometría.
No hay matriz automatizada de navegadores ni un resultado documentado para cada
anchura física. Revisar cambios posteriores en 320/390/430 px, ES/EN, nombres y
cifras largas, orientación horizontal, texto ampliado, foco y vuelta del detalle.
Comprobar PC para no degradar las tablas. [Estrategia](testing.md).

## Fuentes y consecuencias

[WAI disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) orienta la
semántica; no es declaración de conformidad WCAG. Las elecciones visuales fueron
validadas por producto, no por un benchmark de productividad. La apertura ahorra
espacio a cambio de una acción adicional; se permiten varias filas abiertas.
Sin cambios de permisos, dependencias o migraciones. [Decisiones](decisions.md).
