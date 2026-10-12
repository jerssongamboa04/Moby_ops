# Resumen web — Actividad por colaborador

Fecha: 8 de octubre de 2026.

## Contexto y estado

La migración `read_team_summary_by_collaborator.sql` está aplicada en Supabase.
Jersson ejecutó `team_summary_by_collaborator_access.sql` y confirmó el resultado OK:
filas por colaborador, acuerdo con las tarjetas, filtros, ceros, historial inactivo,
duplicados, cambio horario, metadatos, autorización y RLS directo sin cambios.
Checkpoint SQL local confirmado: `3c8c198`.

Este bloque añade la tabla web debajo de las cuatro tarjetas del resumen.
Implementado y validado automáticamente; revisión visual y funcional en el local de Jersson pendiente.

## Lectura y responsabilidades

- `read-team-summary-by-collaborator.ts`: una llamada al RPC público autorizado con
  el mismo mes y UUID de colaborador que las tarjetas. Cliente autenticado por petición,
  desde la página servidor, tras comprobar el perfil activo de supervisor.
- La consulta se lanza en paralelo con las métricas y el listado del selector. No se
  hace una llamada por cada persona; no se amplía el acceso directo a tablas.
- Se validan mes, selección, fechas, nombres, UUID únicos, estado activo y los cinco
  contadores enteros seguros no negativos. Cada acción válida no supera atendidas.
- La suma de cada columna debe coincidir con `total_metrics`. Una respuesta incoherente
  se muestra como error, nunca como un total fabricado. Selección individual: una fila
  exactamente, correspondiente a su UUID. Equipo vacío: solo se acepta total cero.
- Solo mes, nombres, UUID, estado activo y los cinco contadores cruzan al componente
  cliente. Los campos adicionales del proveedor se descartan.
- Las consultas tienen el límite de red existente de 10 segundos. `42501` redirige a
  acceso denegado; `22023` identifica filtros inválidos; otros fallos no muestran SQL
  interno, credenciales o mensajes del proveedor.
- Tabla y tarjetas son consultas independientes: nuevas actuaciones entre consultas
  pueden producir una diferencia transitoria. Actualizar vuelve a consultar ambas;
  no se falsifica ni sustituye un resultado para hacer coincidir dos instantes distintos.

## Interfaz

Referencia: `docs/design/web/summary-approved.png`, bloque «Actividad por colaborador».
Cabecera con mes en una etiqueta redondeada, tabla blanca compacta, iniciales decorativas,
colaborador y cinco columnas: atendidas, aseguradas, pata colocada, reposicionadas e
inválidas. Inválidas en etiquetas rosas; total en fondo verde claro. Los avatares son
neutros: no se infiere identidad o privilegios por el nombre.

Nombres reales y orden del servidor; identificación React por UUID, no por nombre.
Las personas inactivas con historial mantienen una indicación «Inactivo».
Una persona sin actuaciones conserva su fila con ceros reales. Sin colaboradores hay
un estado vacío explícito. Ante error se conserva el resto del resumen y se utiliza el
botón Actualizar existente, sin añadir un segundo control ni hora de actualización.

ES/EN comparte el selector actual. Mes y números se localizan. Encabezados semánticos
con `scope`, nombre accesible de tabla con su periodo e iniciales `aria-hidden`.
En pantallas estrechas solo la tabla tiene desplazamiento horizontal, accesible por
teclado. Los nombres pueden envolver. No se añaden enlaces de detalle hasta construir
la consulta de Actividad con evidencias reales.

No hay nuevas dependencias, migraciones ni cambios de permisos en este parche.
Los estilos se añaden como bloque independiente en `globals.css`, preservando el ajuste local del tamaño
del icono kickstand realizado por Jersson.

## Validación

Pruebas de servicio: lectura agrupada, campos mínimos, filtros, ceros, equipo vacío,
respuesta malformada, UUID duplicado, totales incoherentes, acceso revocado y fallos.
Pruebas de componente: columnas y total reales, persona seleccionada, estado inactivo,
vacío frente a error, traducción y tarjetas utilizables con error de tabla.
Pruebas de página: mismos filtros enviados a SQL y revocación de permiso durante la lectura.

En el entorno de preparación: 144 pruebas web pasan, ESLint y TypeScript pasan,
y build de producción correcto. No se ha renderizado el navegador ni verificado
Supabase desde este entorno; esa comprobación se realiza en el local autorizado.

Revisión local antes de commit:

1. Todos los colaboradores: nombres, columnas, inválidas y total mensual reales.
2. Seleccionar una persona: una fila y su total; conservar el mes seleccionado.
3. Cambiar de mes, incluyendo uno sin actuaciones: ceros reales, sin datos de demostración.
4. Actualizar después de una actuación nueva: tabla y tarjetas se vuelven a consultar.
5. ES/EN: cabecera, mes, columnas y errores.
6. Comparar espaciado, tamaños, badges y pie con el mockup; probar ancho estrecho y teclado.
