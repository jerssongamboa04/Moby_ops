# Tasks — continuidad visual con Home

## Decisión y alcance — 2026-09-26

Jersson confirma que Home y el ajuste de teclado funcionan tras las pruebas
manuales. Solicita continuar con Tasks replicando el encabezado de Home.

Tasks adopta la cabecera editorial aprobada: fondo #262626, logo original a
166:30, título verde MOBY, lema gris y línea verde. Se reutilizan los textos
vigentes «Actuaciones / Tasks» y «Cada actuación cuenta. / Every action counts.».
El contenido blanco se superpone 24 puntos con esquinas superiores redondeadas.
Se conserva ScrollView para pantallas pequeñas y texto ampliado.

Este cambio es de presentación. El historial todavía no está conectado y se
conserva su aviso explícito. No se muestran contadores ni registros ficticios.
No se añaden dependencias, estado, consultas, permisos o migraciones. Home y el
borrador no se modifican. Se reutilizan el recurso SVG y los tokens existentes;
no se introduce una abstracción compartida que obligue a refactorizar Home.

## Comprobación

Ejecutar tests de navegación, typecheck y lint. En Android revisar cabecera,
proporciones y superposición en ES/EN, fuente ampliada, y comprobar que cambiar
Home → Tasks → Home conserva el borrador. Validación visual de Tasks pendiente.
Conectar las actuaciones reales es una tarea posterior.


## Revisión aprobada — 2026-09-27

El usuario confirma el historial funcional y aprueba el mockup Hoy/Mes.
Se implementa el resumen «Tareas / Tasks» con dos métricas: Done (counted)
e Invalid (repeated). Estos dos nombres se mantienen en inglés en ambos idiomas
por petición explícita. Se elimina el párrafo de reglas y el total de guardadas.
Las tarjetas muestran ID, hora HH:mm de Dublín, check verde o rojo y una fila
con icono por acción realizada. Los iconos de acciones coinciden con Home
(bicicleta para pata, candado para asegurada, movimiento para reposicionada).
Los checks incluyen etiquetas para lectores de pantalla; Invalid identifica
repeticiones conservadas, no un fallo de envío. En Mes se aplican las mismas
métricas al resumen y al desglose diario. Se preserva el logo SVG original.

Se reutilizan datos del servidor, paginación, refresco y consultas existentes.
No hay migraciones, cambios nativos ni dependencias nuevas.

Validación: pruebas de pantalla/servicio/navegación, TypeScript y lint.
Pendiente comprobar visualmente en Android el tamaño normal y ampliado,
los dos idiomas, una tarea válida y una repetida, y la navegación de meses.
El mockup guía la jerarquía; no se incorporan sus datos ficticios a la app.


## Contador compacto y detalle por día — 2026-09-27

Propuesta 1 aprobada: se elimina el título de la tarjeta de totales tanto en
Hoy como en Mes; padding de 24 a 16, sin margen superior de métricas.
Hoy elimina fecha y «Actividad de hoy». Mes conserva navegación y fechas.
Pulsar un día abre sus registros con las mismas tarjetas que Hoy, fecha visible,
reintento, actualización y páginas de 50. Volver al mes conserva el mes elegido;
el botón Atrás de Android también vuelve al mes. El selector Hoy/Mes sale del
detalle. El retorno está disponible incluso durante carga o error.

El RPC existente amplía p_view con 'day'. Se conserva su firma para compatibilidad:
p_month contiene la fecha exacta en modo day y el primer día del mes en modo
month. Se rechazan fechas futuras/ausentes/no finitas. No cambia RLS, índices,
registros ni la regla de conteo. La migración usa CREATE OR REPLACE FUNCTION.

Validación local: 40 tests de pantalla/servicio/navegación; TypeScript y lint.
PostgreSQL local: detalle diario, límites Dublín/DST, aislamiento de usuarios,
permisos, duplicados y paginación con 1005 registros. SQL de regresión ejecutado
localmente con rollback. No equivale a validación remota ni visual en Android.

Aplicación pendiente de aprobación de migración (contrato 0.6):
1. Aplicar el parche incremental sobre la revisión visual anterior.
2. Tras aprobar, ejecutar supabase/migrations/read_own_tasks_day.sql completo,
   BEGIN a COMMIT. Requiere la migración read_own_tasks.sql ya instalada.
3. Ejecutar supabase/tests/own_tasks_day_access.sql completo, BEGIN a ROLLBACK.
4. Revisar Hoy sin fecha/título y Mes → día → siguiente página → volver al mes,
   ES/EN y fuente ampliada. Confirmar errores/reintento y botón Atrás Android.
No requiere dependencias ni nueva APK. No volver a ejecutar la migración antigua.
