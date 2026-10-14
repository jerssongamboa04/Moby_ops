# Plataforma web: comportamiento vigente

Actualizado: 14 de octubre de 2026. Código de referencia: PR #4, `38496c2`.
Responsable de producto: Jersson Gamboa. Esta guía sustituye el estado provisional
 del primer checkpoint; los contratos detallados siguen en sus documentos.

## Alcance y acceso

Web de consulta con dos vistas: Summary y Activity. Supervisor y manager tienen
el mismo alcance de negocio; el esquema solo admite `employee`/`supervisor`.
Acceso web exige `supervisor` activo. No se gestionan cuentas, asignan tareas,
editan registros ni se convierten inválidas a válidas. MFA pospuesto.

Login email/contraseña para una cuenta preparada. Invitación, set-password y
recuperación web no están implementados. El flujo móvil usa su callback propio;
no cambiar su Site URL para habilitar funcionalidades web inexistentes.

## Summary

Bienvenida, fecha Dublín, filtros de mes y persona, gráfica de hasta cuatro meses,
cuatro métricas mes/hoy y actividad por colaborador. Mes actual marcado En curso.
Hoy siempre significa día actual Dublín, también con filtro histórico.
Atendidas cuenta actuaciones válidas; aseguradas/pata/reposicionadas cuentan sus
checks válidos. Inválidas se presentan aparte. No hay selección interactiva de
una tarjeta de métrica ni comparación de productividad inventada.

Personas activas sin actividad conservan ceros; inactivas con historia pueden
aparecer sin recuperar acceso. Equipo separado se descartó para evitar repetir
el listado de actuaciones. Error de servicio no se presenta como cero.

## Activity

Abre en Hoy, todos los colaboradores, recientes primero. Filtros de persona,
día/mes y validez; búsqueda literal por ID; páginas de 25. Detalle con acciones,
observaciones, ubicación puntual, estado y fotos antes/después si existen.
Fotos con acceso temporal, ampliación/zoom y mensajes de ausencia/caducidad.
No rastreo continuo ni descripción automática de evidencia.

Filtros en URL; datos al entrar, cambiar selección o Actualizar, sin realtime.
El listado conserva as_of al paginar; no es snapshot frente a edición administrativa.
Fecha autoritativa del cómputo: created_at servidor en Europe/Dublin.

## Presentación y marca

Escritorio: navegación lateral, controles, tablas y panel de detalle. Móvil hasta
760 px: cabecera compacta, desplegable con tarjeta personal/ES-EN/salida, métricas
2 × 2 y filas expandibles de colaboradores/actuaciones. Misma información, sin
columnas recortadas. Las cuatro métricas son blancas y uniformes.

Paleta MOBY, SVG/logo originales, icono original de pata. Summary conserva Dublín;
Activity utiliza la ruta ilustrada con sus acciones. Inter para texto y Archivo
para títulos/cifras mediante next/font. La compilación puede necesitar descargar
fuentes; no introducir una licencia de Neue Haas no disponible.

## Implementación y evidencia

Next.js App Router/React/TypeScript/Tailwind, i18next y Supabase SSR. Gráfica SVG
propia, no Recharts. Cliente autenticado por petición, lectura SQL autorizada,
validación de contratos y errores explícitos. [Arquitectura](architecture.md),
[decisiones](decisions.md), [acceso](security.md).

PR #4: 218 pruebas web en preparación, CI exitoso, revisión local comunicada por
Jersson y Vercel exitoso para `38496c2`. Esto no equivale a E2E en todos los
navegadores ni acredita instalación de SQL en otra instancia.
[Pruebas](testing.md) y [operación](deployment.md) detallan estos límites.
