# Despliegue y diagnóstico de versiones

La web y la APK son entregables diferentes. Esta guía no ejecuta publicaciones.

## Web: GitHub → Vercel

Proyecto web con Root Directory `web` y rama de producción `main`. Variables
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Production;
configurarlas también en Preview para revisar ramas con Auth/datos reales.
No usar las variables EXPO ni claves privilegiadas. Un cambio de configuración
requiere nueva compilación/despliegue para que se refleje en el artefacto.

1. Preparar un PR con código, pruebas y documentación. Ejecutar controles en web
   y raíz si el alcance afecta ambos proyectos; revisar CI del commit correcto.
2. Abrir el Preview y comprobar acceso, Summary, Activity, evidencias y móvil/PC.
   Un Preview sin variables no acredita una app conectada.
3. Integrar a `main`. La integración Git de Vercel genera un deployment de esa
   referencia. Comprobar estado y commit; no basta con que el push haya terminado.
4. Abrir dominio de producción, revisar datos y versión. Registrar la referencia
   publicada. No volver a ejecutar migraciones solo para actualizar CSS/React.

Checkpoint de esta guía: PR #4 fusionado como `38496c2`, con `a8b8037` dentro;
Vercel informó despliegue correcto. `46b72e8` corresponde al PR #3 anterior.
El hash de merge puede diferir del commit de rama sin que falten los cambios.

## Si aparece una versión anterior

| Síntoma | Comprobación / acción |
| --- | --- |
| Git muestra push, dominio sigue antiguo | Revisar si PR se fusionó y cuál es Production Branch |
| Vercel abre `46b72e8` | Abrir Deployments y localizar el nuevo commit, no la ficha antigua |
| Se hizo Redeploy del antiguo | Redeploy reconstruye esa versión; crear deployment de la referencia nueva |
| No hay deployment nuevo | Revisar integración Git, rama y estados en GitHub/Vercel antes de repetir push |
| Nuevo deployment falló | Revisar logs y variables del entorno concreto; no promover uno fallido |
| Preview no conecta, Production sí | Revisar alcance Preview de variables y volver a desplegar Preview |
| Archivo local corregido pero UI antigua | Confirmar carpeta/URL/puerto, dev frente a start, recompilar y recargar |

Una compilación correctora no requiere cambiar el Site URL móvil. La web actual
usa login por contraseña; no tiene un callback propio de invitación/reset.

## SQL y cambios de datos

El merge de una migración en Git **no aplica SQL en Supabase**. Revisar
dependencias, aprobar cambio, ejecutar en entorno controlado, probar y registrar
resultado antes de habilitar consumidores. Scripts CREATE no son automáticamente
idempotentes. No existe en este repo una automatización de migraciones en CI.
Datos demo tienen carga/retirada propias; [procedimiento](dashboard-demo-data.md).

## Distribución móvil

EAS development permite capacidades nativas y Metro. Preview es distribución
interna y usa su entorno/canal; production tiene configuración propia. Usar
CLI compatible con `eas.json` (`>=24.7.0`) y variables EXPO en el entorno elegido.
Consultar [EAS Update](eas-update.md) antes de build o publicación.

`runtimeVersion` fingerprint acota compatibilidad de OTA. Nuevos módulos nativos
requieren build; una actualización web de Vercel no modifica APK. Configurar
canal no demuestra instalación/recepción de update. Verificar con APK real.

## Reversión

Identificar deployment/commit correcto antes de volver a una versión anterior.
Revertir UI no revierte base de datos: revisar compatibilidad si el cambio tocó
contratos. No borrar datos de actividad ni archivos privados como método de
rollback. Para corregir estilos, publicar un commit de corrección verificable.

Referencias: [Git en Vercel](https://vercel.com/docs/git),
[gestión de despliegues](https://vercel.com/docs/deployments/managing-deployments),
[runtimes EAS](https://docs.expo.dev/eas-update/runtime-versions/).
