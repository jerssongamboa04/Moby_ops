# Summary móvil: cuadrícula refinada de métricas

Fecha: 13 de octubre de 2026. Referencia aprobada: cuadrícula refinada adjunta
por Jersson, anterior a las tres variantes posteriores.

Hasta 760 px las cuatro métricas se presentan en dos columnas y dos filas.
Icono original sobre círculo verde claro junto a la etiqueta, cifra mensual
destacada, subtítulo de periodo y pie separado con Hoy y su valor en una pastilla.
Las cuatro tarjetas tienen fondo blanco y el mismo borde neutro. Verde claro
solo en los iconos y las pastillas de Hoy, por igual. No hay énfasis individual
ni estados de hover/selección: las tarjetas son informativas.

Una sola representación y los mismos datos del servidor, sin nuevas consultas
ni cálculos de negocio. Los totales del mes y de hoy mantienen su separación;
las inválidas siguen fuera de estas métricas. Cambiar filtros conserva los
valores reales y errores existentes. El encabezado utiliza el mes seleccionado.

La etiqueta móvil de atendidas es corta; el nombre accesible de la métrica
sigue siendo completo. Subtítulo Este mes cuando el periodo coincide con el
mes de today devuelto por el servidor, Mes seleccionado para históricos.
Ambas etiquetas, y las demás, se traducen a inglés mediante el proveedor actual.

CSS conserva la disposición de escritorio. En pantallas de hasta 360 px las
etiquetas pasan debajo del icono para evitar columnas de texto estrechas.
Números largos pueden envolver texto. Se conservan bicycle-outline.svg,
lock-closed-outline.svg, kickstand.svg y move-outline.svg; no nuevos iconos.

Base de integración: parches móviles, tarjeta personal y colaboradores con
desplegables ya aplicados. Cambia componente, CSS, traducciones, prueba y este
documento; no cambia Supabase, datos, autenticación ni dependencias.

TDD: prueba roja por subtítulos ausentes y verde con la implementación.
Verifica mes actual frente a histórico, separación de cifras, ceros y ES/EN.
Se ejecutan suite completa, lint, TypeScript y build. QA visual pendiente:
Safari/Chrome a 320, 390 y 430 px, nombres de métricas en inglés, cifras grandes,
mes histórico, zoom de texto y escritorio. Pruebas DOM no miden geometría.

Aplicar en fix/web-mobile-responsive para una sola integración con el resto
de ajustes. El parche no realiza commit, push ni despliegue.
