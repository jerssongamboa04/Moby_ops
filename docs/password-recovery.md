# Recuperación de contraseña

Implementada desde el login en ES/EN, sin dependencias ni migraciones nuevas.

1. «Forgot password?» / «¿Olvidaste tu contraseña?» abre el formulario de email.
2. La app llama a `resetPasswordForEmail`, con `redirectTo: mobyops://auth/callback`.
3. La confirmación es genérica; no consulta ni expone si existe la cuenta. Los errores se traducen sin mostrar detalles del servidor. Hay bloqueo durante el envío y espera local de 60 segundos antes de repetir (no sustituye los límites de Supabase).
4. El callback acepta `invite` y `recovery`. Los tokens solo crean sesión si Supabase los valida. Los errores o enlaces sin los tokens requeridos muestran el estado de error existente.
5. Recuperación reutiliza la pantalla de contraseña, con textos propios y las reglas existentes: 12 caracteres, mayúscula, minúscula, número, símbolo y confirmación.
6. Tras guardar con `updateUser`, el usuario vuelve al login mediante cierre de sesión local. No se revocan sesiones de otros dispositivos.

## Configuración que comprobar en Supabase

- Authentication → URL Configuration: permitir exactamente `mobyops://auth/callback` como Redirect URL.
- La plantilla Reset Password debe conservar el enlace de verificación `{{ .ConfirmationURL }}`. No enlazar directamente a la app saltándose la verificación.
- Usar el cliente móvil instalado con el esquema `mobyops`; abrir el correo desde ese teléfono. Expo Go no sustituye la instalación con ese esquema.
- Para enviar a los trabajadores, configurar SMTP propio si aún no existe. El SMTP predeterminado de Supabase restringe destinatarios a miembros del equipo del proyecto y no está destinado a producción. No añadir trabajadores al equipo administrativo para resolver esto.
- No incluir claves SMTP ni claves service-role en la app.

Referencias oficiales consultadas el 28-09-2026:
https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
https://supabase.com/docs/guides/auth/native-mobile-deep-linking
https://supabase.com/docs/guides/auth/redirect-urls
https://supabase.com/docs/guides/auth/auth-smtp

## Validación en dispositivo pendiente

La verificación local usa mocks: no se ha enviado un correo real ni modificado la configuración de Supabase.

- Solicitar enlace para una cuenta de prueba autorizada; recibir correo, abrirlo con la app cerrada y después repetir con la app abierta.
- Guardar una contraseña nueva, volver al login e iniciar sesión con ella; comprobar que la anterior ya no permite iniciar sesión.
- Probar enlace caducado/usado y solicitar otro. No compartir enlaces ni tokens en capturas o logs.
- Comprobar que un email inexistente mantiene la confirmación genérica cuando Supabase acepta la solicitud.
- Probar sin conexión, doble pulsación y reintento después de la espera.
- Revisar teclado Android en email, contraseña y confirmación.
- Confirmar que una invitación nueva conserva su flujo y sus textos de creación de contraseña.
