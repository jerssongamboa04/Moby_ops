# Estrategia de validación

Los controles verifican capas distintas; no intercambiar su significado.

| Capa | Dónde | Qué acredita | Qué no acredita |
| --- | --- | --- | --- |
| Jest móvil | `__tests__/` | Estados UI, validación, sesión y envío con respuestas controladas | Cámara/GPS/enlaces nativos en cada teléfono |
| Vitest web | `web/tests/` | Acceso, contratos, filtros, cifras e interacción DOM | Geometría real, todas las combinaciones Safari/Chrome |
| SQL | `supabase/tests/` | Regla temporal, duplicados, ACL y casos negativos en el entorno donde se ejecuta | Que otra instancia tenga esas migraciones |
| Lint / TypeScript | Scripts de cada proyecto | Reglas estáticas y tipos | Corrección de una política o datos reales |
| Build Next | `web/` | Compilación de rutas y bundle de producción | Configuración efectiva de Supabase o login real |
| Revisión física / navegador | Entorno de prueba identificado | Flujo nativo, fotos, datos reales y lectura responsive | Una certificación general de accesibilidad |

## Checkpoint publicado

PR #4 integró `a8b8037` mediante `38496c2` el 14 de octubre de 2026. La preparación
final pasó 218 pruebas web, lint, TypeScript y build; CI del PR terminó correctamente.
Jersson dio por terminadas las vistas móviles tras revisión local. No hay una
matriz automatizada de E2E por navegador ni evidencia completa para atribuir
validación a todas las anchuras/dispositivos. El número 218 es histórico.

CI tiene dos jobs: raíz con lint, typecheck y Jest `--runInBand`; `web-quality`
con npm ci, lint, typegen/typecheck, Vitest y build. SQL y pruebas físicas no se
ejecutan en ese workflow. [Configuración](../.github/workflows/ci.yml).

## Casos de regresión que importan

Autenticado no supervisor, perfil inactivo, sesión inválida y fallo de servicio
son casos distintos. Métricas deben conservar ceros reales sin convertir errores
en cero; hoy usa Dublín aunque el mes sea histórico. Duplicados se clasifican
antes de filtros/páginas; comprobar empate de timestamp, DST y otro empleado.

En responsive: abrir/cerrar menú, Escape/foco, ES/EN, varias filas abiertas,
valores y nombres largos, 320/390/430 px, horizontal y texto ampliado. Sin perder
inválidas, foto ausente ni tareas realizadas. En PC conservar tablas y jerarquía.
En detalle: autorización, URL caducada, reintento, zoom, mapa y retorno de foco.

Una prueba roja debe fallar por comportamiento ausente. Las pruebas DOM de
matchMedia no sustituyen medir CSS en navegador. Las pruebas SQL sintéticas no
suben fotos reales. La revisión de una demo no prueba el envío operativo móvil.

## Cómo registrar resultados

Anotar commit, comando, entorno, fecha y resultado; para una comprobación manual,
qué flujo y dispositivo se revisaron. En nueva instancia ejecutar los tests SQL
correspondientes después de revisar/aplicar el esquema autorizado; no afirmar
que se validaron por leer el archivo. No aplicar `audit fix --force` como parte
rutinaria de una validación. `npm audit --omit=dev` produce un resultado fechado,
no una garantía permanente de ausencia de vulnerabilidades.
