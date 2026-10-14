# Leer y mantener MOBY Ops

Punto de entrada actualizado al 14 de octubre de 2026, sobre el código integrado
en `main` por PR #4 (`38496c2`). Esta documentación explica lo implementado y
sus límites; no certifica el estado de una instancia Supabase distinta.

## Ruta de lectura

| Necesidad | Documento |
| --- | --- |
| Saber qué hace el producto y cómo se organiza | [README raíz](../README.md) |
| Seguir una actuación desde el móvil hasta la web | [Arquitectura](architecture.md) |
| Entender por qué se eligió cada solución | [Decisiones](decisions.md) |
| Preparar equipo y ejecutar aplicaciones | [Desarrollo](development.md) |
| Entender acceso, evidencias y límites | [Seguridad](security.md) |
| Elegir qué validar y qué no acredita cada prueba | [Pruebas](testing.md) |
| Desplegar, identificar versión y diagnosticar | [Operación](deployment.md) |
| Ver la interfaz desplegada y el contexto de las capturas | [Vistas actuales](current-app-views.md) |
| Entender comportamiento actual del dashboard | [Plataforma web](web-platform.md) |

## Detalle técnico por vertical

| Área | Lecturas |
| --- | --- |
| Auth web | [Sesión y permisos](web-auth-session.md) |
| Registro móvil | [Envío](public-order-submission.md), [validación ID](bicycle-id-validation.md), [escáner](bicycle-scanner.md) |
| Historia propia | [Tasks](tasks-history.md) |
| Summary | [Cálculo SQL](web-real-summary-metrics.md), [filtros SQL](web-summary-filters-data.md), [colaboradores](web-summary-collaborator-table.md), [gráfica](web-summary-monthly-chart.md) |
| Activity | [Datos](web-activity-data.md), [listado](web-activity-list.md), [detalle autorizado](web-activity-detail-data.md), [panel](web-activity-detail-panel.md) |
| Responsive | [Marco móvil](web-mobile-responsive.md), [métricas](web-mobile-metrics-grid.md), [colaboradores](web-mobile-collaborators.md), [actuaciones](web-mobile-activity-list.md) |
| Distribución móvil | [EAS Update](eas-update.md), [splash](splash-screen.md) |
| Demostración | [Datos demo](dashboard-demo-data.md) |

## Estado actual frente a registro histórico

Las guías de entrada describen el estado integrado. Los documentos de vertical
fechados registran contratos, pruebas y decisiones en su momento: frases como
«pendiente» o «no aplicado» pueden describir ese checkpoint. No tomarlas como
estado actual sin contrastar código y guía vigente. Los registros de fundación
conservan contexto de las primeras iteraciones.

La evidencia de código vive en los archivos enlazados; la evidencia de ejecución
remota requiere resultados del entorno. Que exista una migración no demuestra
que se haya aplicado. Que una prueba DOM pase no acredita geometría, cámara,
GPS, descarga real de una foto ni acceso operativo en producción.

## Qué actualizar con un cambio

Actualizar la guía afectada y, si cambia el motivo o un límite, [decisiones](decisions.md).
Cada decisión debe incluir problema, alternativa elegida, consecuencias y archivos
que permiten verificarla. Diferenciar decidido, implementado, comprobado localmente,
validado manualmente e integrado. Registrar fecha/commit para cifras de pruebas.
No añadir promesas de rendimiento, conformidad o cobertura sin mediciones.

Conservar los detalles de contratos SQL útiles; enlazarlos desde aquí. Evitar
copiar variables reales, tokens, URLs de evidencia firmadas o datos de cuentas.
Los cambios de documentación no ejecutan migraciones ni publican actualizaciones.
