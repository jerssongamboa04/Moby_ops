# Decisiones de diseño y arquitectura

Registro consolidado del estado integrado al 14 de octubre de 2026. Las fechas
originales se conservan en documentos de vertical; esta consolidación no inventa
reuniones, benchmarks ni alternativas formalmente evaluadas donde no hay evidencia.

## 1. Un repo, dos proyectos independientes

**Problema:** móvil y dashboard comparten reglas de datos, pero necesitan builds
y herramientas distintas. **Decisión:** Expo en raíz, Next.js en `web/`, SQL en
`supabase/`; dos lockfiles y CI separado. **Alternativas registradas:** repo web
separado o mover Expo a un workspace. La primera complica coordinar SQL/UI; la
segunda modifica EAS/Metro sin una necesidad actual. **Consecuencia:** ejecutar
comandos desde la carpeta correcta y mantener versiones por proyecto; no asumir
paquetes compartidos. Evidencia: [manifiestos](../web/package.json),
[CI](../.github/workflows/ci.yml), [fundación histórica](web-foundation-checkpoint.md).

## 2. Autorización de equipo en SQL, sesión del usuario en web

**Problema:** ocultar botones no protege datos. **Decisión:** Next verifica
identidad con `getUser` y perfil propio; funciones de equipo verifican `auth.uid()`
y supervisor activo en BD. RPC públicos con invoker y lógica privada con definer,
`search_path` vacío y nombres cualificados. **Alternativa que se evita:** consultar
con una clave administrativa desde el dashboard, saltando las políticas del usuario.
**Consecuencia:** más contratos/pruebas negativos, pero mismo límite de acceso para
UI y llamada directa. No hay rol técnico manager ni ACL derivada de una etiqueta UI.
Evidencia: [acceso](../web/src/lib/auth/access.ts),
[SQL de equipo](../supabase/migrations/read_team_activity.sql).
Referencia: [getUser](https://supabase.com/docs/reference/javascript/auth-getuser).

## 3. Derivar validez y conservar repetidas

**Problema:** contar duplicados como trabajo válido distorsiona productividad;
borrarlos elimina trazabilidad. **Decisión:** primera por persona/bicicleta/día
Dublín mediante ranking, desempate `created_at,id`; repetir se reporta por separado.
**Alternativas:** rechazar toda repetida o almacenar un flag editable. La regla
actual mantiene evidencia y evita dos autoridades del mismo cálculo.
**Consecuencia:** filtrar validez después de clasificar; comprobar límites de día,
DST y empates. No contar IDs únicos globales ni sumar candado+pata+reposición como
atendidas. Evidencia: [consulta](../supabase/migrations/read_team_activity.sql),
[pruebas](../supabase/tests/team_activity_access.sql).

## 4. Filtros en URL y páginas de 25 con corte temporal

**Problema:** revisar historia y volver al mismo periodo/persona con resultados
estables frente a nuevas inserciones. **Decisión:** URL validada, OFFSET de 25 y
`as_of` conservado al paginar; cambiar filtros o actualizar reinicia lectura.
**Tradeoff:** frente a cargar toda la actividad o recurrir a scroll sin páginas
visibles, la versión actual mantiene navegación explícita y acota la respuesta. **Consecuencia:** el corte no es snapshot de edición ni garantía de
rendimiento de OFFSET a gran escala. Cursor/keyset o índices adicionales requieren
mediciones; no se documentan como ya implementados.
Evidencia: [filtros](../web/src/lib/activity/activity-filters.ts).

## 5. Storage privado y firma solo al pedir detalle

**Problema:** consultar actividad no debe publicar permanentemente fotos ni
precargar evidencia de todo el equipo. **Decisión:** bucket privado, RLS vinculada
al registro y URLs firmadas por 5 minutos con sesión de usuario. **Alternativas:**
bucket público o URLs permanentes; no satisfacen el alcance temporal de lectura.
**Consecuencia:** caducidad y reintento visibles; firma es acceso por posesión y no
se invalida de inmediato al desactivar un perfil. Dos subidas previas a SQL dejan
un riesgo de archivos huérfanos. Evidencia: [lector](../web/src/lib/activity/read-activity-detail.ts).
Referencia: [descarga privada](https://supabase.com/docs/guides/storage/serving/downloads).

## 6. SVG para cuatro meses y texto accesible

**Problema:** el gráfico desktop de 900 unidades reduce demasiado las etiquetas
al escalar en móvil. **Decisión implementada:** SVG desktop y móvil de 360 unidades,
meses abreviados y una tabla accesible común, mismos datos y cálculos. El plan
inicial nombraba Recharts; el manifiesto y componente finales no lo usan.
**Consecuencia:** sin dependencia de charts, pero geometría/etiquetas son propias
y requieren pruebas visuales con valores distintos. No se afirma que SVG sea
siempre superior a una librería para futuras gráficas más complejas.
Evidencia: [gráfica](../web/src/components/summary-monthly-chart.tsx).

## 7. Responsive como lectura adaptada, no columnas perdidas

**Problema:** navegación alta y tablas anchas impedían revisar tareas en teléfono.
**Decisiones aprobadas:** menú suave con tarjeta personal e idioma dentro; cuatro
métricas en 2 × 2; colaboradores y actuaciones desplegables. **Alternativas visuales:**
tabs permanentes frente a menú; métricas en lista frente a cuadrícula; filas
completas frente a plegadas o agrupadas por fecha. La cuadrícula evita que Summary
sea solo listas; los desplegables permiten ver más identidades juntas.

**Detalle deliberado:** las cuatro métricas son blancas, borde igual y acentos
verde claro iguales. Un énfasis individual parecía selección sin acción posible.
Los estados válido/inválido combinan icono, texto y color. No se cambia el logo,
la silueta ni el icono original de pata por aproximaciones del mockup.

**Consecuencia:** breakpoint de 760 px heredado del marco; a 360 px las etiquetas
cambian de posición. Disclosure no es un menú ARIA de aplicación ni un modal:
botones nativos, `aria-expanded`, controles relacionados y contenido oculto cuando
se pliega. Panel de evidencia mantiene su interacción propia. Mantener varias
filas abiertas favorece comparar; expandir tareas añade una interacción.
Evidencia: [marco](web-mobile-responsive.md), [actuaciones](web-mobile-activity-list.md).
Referencia: [WAI disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

## 8. Separar error, denegación, ausencia y cero

**Problema:** un fallo de backend presentado como 0 parece una caída real de
actividad. **Decisión:** lectores devuelven estados explícitos, validan respuestas
y UI muestra errores/ausencia sin fabricar cifras. **Consecuencia:** más casos
por componente; un cero se muestra solo tras recibir un contrato válido.
Evidencia: [lector de lista](../web/src/lib/activity/read-team-activity.ts),
[pruebas de indicadores](../web/tests/summary-metrics.test.tsx).

## 9. EAS Update condicionado al runtime

**Problema:** distribuir cambios JS sin repetir APK, sin enviar JS incompatible
con módulos nativos. **Decisión configurada:** canales preview/production,
entornos propios y `runtimeVersion` con fingerprint. **Consecuencia:** cambios
nativos requieren build compatible; Vercel y EAS son circuitos distintos.
La configuración no demuestra recepción real de una OTA ni publicación en tiendas.
Evidencia: [configuración](../eas.json), [procedimiento](eas-update.md).
Referencia: [runtime](https://docs.expo.dev/eas-update/runtime-versions/).

## Cómo incorporar otra decisión

Registrar problema observado, opciones realmente revisadas, elección, coste o
limitación y pruebas/archivos de soporte. Si un supuesto no está confirmado,
identificarlo como pendiente. No cambiar código o permisos al editar este registro.
