# Desarrollo local

Esta guía supone un proyecto Supabase ya configurado para MOBY Ops. Clonar el
repo no instala un esquema ni concede acceso a una cuenta.

## Requisitos

Git, Node y npm; Node 22 es la rama usada en CI. La web declara
`^22.12.0 || ^24.0.0`. Dos instalaciones con `npm ci`, una por lockfile.
Para probar móvil con enlaces/cámara/GPS, development build y dispositivo físico.
Android fue el circuito utilizado; Expo Go no acredita el flujo completo.

## Variables separadas

| Cliente | Archivo local | Variables |
| --- | --- | --- |
| Expo | `.env` raíz | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Next.js | `web/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

Copiar el ejemplo y editarlo localmente. Usar la misma URL y publishable key del
proyecto, con nombres propios de cada cliente; no copiar prefijos EXPO a Next.
La web valida HTTPS y clave `sb_publishable_…`. Nunca añadir credenciales
administrativas. No compartir valores mediante capturas o logs.

```bash
# Desde la raíz: aplicación móvil
npm ci
cp .env.example .env
# Editar .env
npx expo start --dev-client
```

Si cambia el runtime nativo, reconstruir el development client. No tratar una
APK antigua como capaz de ejecutar módulos que no contiene.

```bash
# Dashboard: desde la raíz
cd web
npm ci
cp .env.example .env.local
# Editar .env.local
npm run dev
```

Abrir la URL exacta impresa por Next: un puerto ocupado puede provocar otro.
La cuenta web necesita contraseña ya configurada y perfil supervisor activo.
Auth sin perfil válido da acceso denegado, no crea un perfil automáticamente.

## Pruebas antes de un PR

En raíz: `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`.
En `web/`: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
No ejecutar comandos web desde la raíz: `npm run web` inicia Expo Web.
No hay script raíz de build equivalente al de Next.

`npm run start` en `web/` sirve la build existente; editar código no actualiza
ese artefacto. Para revisar cambios usar dev o repetir build/start. Cuando una
corrección está en el archivo pero no aparece: confirmar carpeta, puerto y URL,
reiniciar servidor y recargar navegador antes de cambiar CSS de nuevo.

## Datos y SQL

`supabase/migrations/` son scripts explícitos, no un instalador automático ordenado
por timestamp. Revisar dependencias e historial del entorno; algunos usan CREATE
 y no son reejecutables. Bucket/configuración Storage requieren preparación propia.
Los tests SQL tienen transacciones y fixtures; leerlos antes de ejecutar en un
entorno con datos. No asumir que todos los scripts se pueden pegar juntos.

[Demo](dashboard-demo-data.md) es opcional y separada de instalación/migraciones:
requiere las cuentas previstas y preserva los registros originales. No sustituye
las fotos requeridas para nuevas actuaciones móviles.

## Forma de contribuir

Rama de trabajo desde `main`, cambio acotado y pruebas del comportamiento.
Preparar rutas explícitas y revisar `git diff --cached --check` y el diff antes
de commit; evitar incluir configuración del editor y parches locales.
Los cambios en RLS, migraciones, claves, dependencias o alcance necesitan decisión
concreta y aprobación de producto; documentar límites y validación del entorno.
