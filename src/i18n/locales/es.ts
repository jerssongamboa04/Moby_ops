export const authEs = {
    languageSelector: 'Selector de idioma',
    title: 'Mantén Dublín en movimiento.',
    titleLead: 'Mantén', titleCity: 'Dublín', titleEnd: 'en movimiento.',
    description: 'Entra y pon tu jornada en marcha.',
    email: {
        label: 'Correo electrónico',
        placeholder: 'Email',
    },
    password: {
        label: 'Contraseña',
        placeholder: 'Introduce tu contraseña',
        show: 'Mostrar contraseña',
        hide: 'Ocultar contraseña',
    }, recovery: {
    "title": "Recupera tu contraseña.",
    "description": "Introduce el email de tu cuenta para solicitar un enlace de recuperación.",
    "send": "Enviar enlace",
    "sending": "Enviando...",
    "sent": "Si existe una cuenta asociada a este email, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.",
    "error": "No pudimos procesar la solicitud. Comprueba tu conexión e inténtalo de nuevo más tarde.",
    "wait": "Podrás solicitar otro enlace en {{seconds}} s.",
    "passwordEyebrow": "RECUPERACIÓN DE CUENTA",
    "passwordTitle": "Restablece tu contraseña.",
    "passwordDescription": "Elige una contraseña nueva y confírmala para recuperar el acceso.",
    "save": "Guardar nueva contraseña"
}, setPassword: {
        submit: 'Crear contraseña',
        eyebrow: 'CONFIGURACIÓN DE CUENTA',
        title: 'Crea tu contraseña.',
        description:
            'Protege tu cuenta antes de acceder a tu espacio de operaciones.',
        backToSignIn: 'Volver al inicio de sesión',
        signingOut: 'Cerrando sesión...',
        signOutError:
            'Tu contraseña está guardada, pero no pudimos cerrar la sesión. Inténtalo de nuevo.',
        saving: 'Guardando...',
        saveError: 'No pudimos guardar tu contraseña. Inténtalo de nuevo.',
        successTitle: 'Tu contraseña se ha guardado.',
        successDescription:
            'Podrás usar esta contraseña la próxima vez que inicies sesión.',
        newPassword: {
            label: 'Nueva contraseña',
            placeholder: 'Introduce tu nueva contraseña',
            show: 'Mostrar nueva contraseña',
            hide: 'Ocultar nueva contraseña',
        },
        confirmation: {
            label: 'Confirmar contraseña',
            placeholder: 'Introduce nuevamente tu contraseña',
            show: 'Mostrar confirmación de contraseña',
            hide: 'Ocultar confirmación de contraseña',
        },
        requirements:
            'Usa al menos 12 caracteres, incluyendo mayúscula, minúscula, número y símbolo.',
    },
    callback: {
        processingTitle: 'Comprobando tu enlace...',
        processingDescription:
            'Espera mientras preparamos la configuración de tu cuenta.',
        errorTitle: 'No pudimos abrir este enlace.',
        errorDescription:
            'Comprueba tu conexión y vuelve a abrir el enlace. Si ha caducado o ya se ha utilizado, solicita uno nuevo.',
        backToSignIn: 'Volver al inicio de sesión',
    },
    forgotPassword: '¿Olvidaste tu contraseña?',
    signIn: 'Iniciar sesión',
    signingIn: 'Iniciando sesión...',
    signInError:
        'No pudimos iniciar sesión. Comprueba tu correo, contraseña y conexión e inténtalo de nuevo.',
    helper: 'Acceso seguro para empleados.',
    sessionLoading: 'Cargando tu sesión...',
    workspace: {
        title: 'Tu espacio de operaciones',
        description: 'Has iniciado sesión.',
        signOut: 'Cerrar sesión',
        signingOut: 'Cerrando sesión...',
        signOutError: 'No pudimos cerrar la sesión. Inténtalo de nuevo.',
    },
    profileAccess: {
        loading: 'Comprobando tu acceso...',
        inactiveTitle: 'Acceso no habilitado',
        inactiveDescription:
            'Tu cuenta no tiene habilitado el acceso operativo. Contacta con tu supervisor.',
        missingTitle: 'Configuración de cuenta pendiente',
        missingDescription:
            'El perfil de tu cuenta todavía no está configurado. Contacta con tu supervisor.',
        errorTitle: 'No pudimos comprobar tu acceso',
        errorDescription:
            'Comprueba tu conexión e inténtalo de nuevo.',
        retry: 'Comprobar de nuevo',
    },

} as const;
export const publicOrderEs = {
  steps: { identify: 'Identifica la bicicleta', before: 'Foto antes', after: 'Foto después', review: 'Revisa y envía' },
  photos: {
    before: 'Antes', after: 'Después', add: 'Tomar foto', retake: 'Repetir',
    beforeGuide: 'Muestra cómo encontraste la bicicleta. Repetir esta foto también elimina la foto de después.',
    afterGuide: 'Muestra cómo dejas la bicicleta y las acciones realizadas.',
    permission: 'Permite usar la cámara para tomar las fotos de la actuación.',
    capture: 'Tomar foto', processing: 'Preparando foto…', cancel: 'Volver al formulario',
    error: 'No pudimos preparar la foto. Revisa el acceso a la cámara e inténtalo de nuevo.',
  },
  send: {
    review: 'Revisar y enviar', confirm: 'Enviar actuación', twoPhotos: 'Fotos de antes y después adjuntas.',
    sending: 'Enviando…', retry: 'Reintentar envío', success: 'Actuación registrada. Puedes iniciar otra.',
    error: 'No pudimos confirmar la actuación. Revisa la conexión y el permiso de ubicación y reintenta.',
    pending: 'Conservamos este intento sin cambios para reintentarlo. Mantén la app abierta hasta recibir la confirmación.',
    requirements: 'Necesitas un ID válido, dos fotos y al menos una acción. Solicitaremos la ubicación al enviar.',
  },
  eyebrow: 'OPERACIONES EN CALLE',
  invalidBikeId: 'Revisa el ID de la bicicleta o escanea su código.',
  bikeHint: 'Escanea el código de barras o QR de MOBY, o introduce el ID.',
  scan: 'Escanear código de la bicicleta',
  scanShort: 'Escanear',
  scanner: {
    title: 'Escanear bicicleta',
    close: 'Cerrar escáner',
    loading: 'Comprobando permiso de cámara',
    permission: 'Permite el acceso a la cámara para leer el código de barras. También puedes introducir el ID manualmente.',
    allow: 'Permitir cámara',
    settings: 'Abrir ajustes',
    permissionError: 'No se pudieron comprobar los permisos. Inténtalo de nuevo o introduce el ID manualmente.',
    cameraError: 'No se pudo iniciar la cámara. Cierra el escáner e inténtalo de nuevo, o introduce el ID manualmente.',
    invalidCode: 'Código no reconocido. Escanea el código de barras o el QR de MOBY de la bicicleta.',
    guide: 'Apunta al código de barras o al QR de MOBY de la bicicleta.',
    manual: 'Introducir ID manualmente',
    torchOn: 'Encender luz',
    torchOff: 'Apagar luz',
  },
  tagline: 'Mantén Dublín en movimiento.',
  evidenceTitle: 'Antes + después',
    title: 'Public Order',
    description:
        'Registra la bicicleta y las acciones que has realizado.',
    bikeId: 'ID de la bicicleta',
    bikeIdPlaceholder: 'Introduce ID',
    actions: 'Acciones realizadas',
    actionsHint: 'Selecciona al menos una acción.',
    kickstandPositioned: 'Pata colocada',
    bikeLocked: 'Bicicleta asegurada',
    bikeRepositioned: 'Bicicleta reposicionada',
    notes: 'Observaciones (opcional)',
    notesPlaceholder: 'Añade detalles relevantes',
    evidenceReminder:
        'Se requiere una foto de antes y otra de después de la actuación.',
    discardDraft: 'Descartar borrador',
    discardTitle: '¿Descartar este borrador?',
    discardDescription:
        'La información que has introducido no se ha guardado.',
    keepEditing: 'Seguir editando',
    discard: 'Descartar',
} as const;

export const operationsEs = {
  history: {
    today: 'Hoy', month: 'Mes', loading: 'Cargando tu actividad…', refresh: 'Actualizar',
    error: 'No se pudo cargar tu actividad.', retry: 'Reintentar', empty: 'No hay actuaciones registradas en este periodo.',
    done: 'Done', invalid: 'Invalid',
    invalidStatus: 'Inválida: bicicleta repetida en esta fecha',
    daily: 'Resumen por día',
    backToMonth: 'Volver al mes', openDay: 'Ver tareas del {{date}}',
    previousMonth: 'Mes anterior', nextMonth: 'Mes siguiente', currentMonth: 'Mes actual',
    previousPage: 'Página anterior', nextPage: 'Página siguiente', page: 'Página {{page}}',
  },
  team: 'EQUIPO DE CALLE',
  tasksTitle: 'Cada actuación cuenta.',
  profileEyebrow: 'TU ESPACIO',
  profileTitle: 'Parte del equipo.',
  profileBody: 'Ajustes sencillos para tu día en la calle.',
  preferences: 'Preferencias',
  language: 'Idioma de la app',
  account: 'Cuenta',
  sessionNote: 'Al cerrar sesión se elimina el borrador sin enviar de este dispositivo.',

  home: 'Inicio',
  tasks: 'Actuaciones',
  profile: 'Perfil',
  profileDescription: 'Gestiona tu sesión. Próximamente podrás consultar aquí tus datos de trabajador.',
} as const;
