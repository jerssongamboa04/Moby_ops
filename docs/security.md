# Seguridad y límites de acceso

Describe controles presentes en el código integrado; no es una auditoría externa
ni certificación de conformidad. Revisar el estado de la instancia al desplegar.

## Identidad frente a permisos

Supabase Auth identifica a la persona. `profiles` define `employee`/`supervisor`
e `is_active`; la política permite leer el propio perfil. El móvil exige perfil
activo para operar. La web exige supervisor activo, también en funciones SQL de
lectura de equipo. Manager no es un valor admitido por la tabla.

| Perfil | Operativa propia móvil | Dashboard de equipo |
| --- | --- | --- |
| Employee activo | Sí | No |
| Supervisor activo | Sí | Sí, consulta |
| Inactivo o sin perfil | No autorizado | No autorizado |

Los perfiles inactivos con historia pueden aparecer en métricas sin recuperar
acceso. El supervisor consulta el conjunto del proyecto: no hay aislamiento por
organización/equipo implementado. No presentar el producto como multi-tenant.

## Sesión y claves

Móvil: adaptador de Expo Secure Store, renovación ligada al ciclo de la app.
Web: cliente SSR por petición, verificación `getUser`, cookies HttpOnly,
SameSite=Lax, Secure en producción; Proxy renueva cookies y Server Actions
propagan escrituras. No hay un cliente Auth web que persista en localStorage.
Cerrar sesión web usa `scope: local`, no invalida automáticamente sesiones móviles.

Las claves publishable son configuración cliente, no elevan permiso por sí solas.
RLS/ACL y comprobación del perfil son necesarias. Ni app ni dashboard incorporan
service_role o clave secret. No registrar tokens ni URLs firmadas en repositorio.

## Funciones y tablas

Funciones de equipo privadas con SECURITY DEFINER verifican caller, fijan
`search_path` vacío y cualifican relaciones. La ejecución autenticada no permite
saltarse la comprobación de perfil. Los wrappers públicos conservan invoker.
La operativa se escribe a través de RPC: no conceder inserciones directas para
resolver un fallo del formulario. El envío deriva employee de `auth.uid()`.
Observaciones se presentan como texto, no HTML.

## Fotografías y ubicación

Bucket `public-order-evidence` privado; rutas por empleado/actuación/fase.
Storage autoriza archivos propios y evidencia registrada visible al supervisor.
Detalle firma durante 300 segundos con credenciales del usuario; devuelve
cabeceras privadas/no-store y no-referrer. Una URL firmada es un permiso temporal
por posesión: una vez emitida puede seguir válida hasta caducar incluso si se
revoca el perfil. No prometer revocación instantánea.

Coordenadas corresponden al registro, no a seguimiento continuo. Mapas externos
se abren solo desde el enlace de ubicación. El listado no precarga coordenadas
ni fotos de todos los registros. Sin descripción automática de fotografías.

## Límites que deben seguir visibles

MFA pospuesto; invitación, set-password y recuperación web no implementados.
El envío valida metadatos de Storage, no inspecciona MIME binario en backend.
No hay limpieza programada de objetos huérfanos ni cola offline persistente
acreditada por el código. TLS/cookies no sustituyen política de retención,
proceso de bajas o una revisión de permisos del entorno.

Referencias: [getUser](https://supabase.com/docs/reference/javascript/auth-getuser),
[RLS de Storage](https://supabase.com/docs/guides/storage/security/access-control),
[URLs privadas](https://supabase.com/docs/guides/storage/serving/downloads).
[Contratos de detalle](web-activity-detail-data.md) · [Pruebas](testing.md).
