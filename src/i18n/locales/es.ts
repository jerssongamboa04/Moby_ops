export const authEs = {
    languageSelector: 'Selector de idioma',
    eyebrow: 'EQUIPO DE CALLE MOBY',
    title: 'Mantén Dublín en movimiento.',
    description: 'Inicia sesión para acceder a tu espacio de operaciones.',
    email: {
        label: 'Correo electrónico',
        placeholder: 'nombre@moby.ie',
    },
    password: {
        label: 'Contraseña',
        placeholder: 'Introduce tu contraseña',
        show: 'Mostrar contraseña',
        hide: 'Ocultar contraseña',
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
        processingTitle: 'Comprobando tu invitación...',
        processingDescription:
            'Espera mientras preparamos la configuración de tu cuenta.',
        errorTitle: 'No pudimos completar la invitación.',
        errorDescription:
            'Comprueba tu conexión y vuelve a abrir la invitación. Si el problema continúa, contacta con tu supervisor.',
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