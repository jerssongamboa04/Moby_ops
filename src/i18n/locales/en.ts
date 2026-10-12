export const authEn = {
  languageSelector: 'Language selector',
  title: 'Keep Dublin moving.',
  titleLead: 'Keep', titleCity: 'Dublin', titleEnd: 'moving.',
  description: 'Sign in and get your day moving.',
  email: {
    label: 'Email',
    placeholder: 'Email',
  },
  password: {
    label: 'Password',
    placeholder: 'Enter your password',
    show: 'Show password',
    hide: 'Hide password',
  }, recovery: {
    "title": "Reset your password.",
    "description": "Enter your account email to request a password reset link.",
    "send": "Send link",
    "sending": "Sending...",
    "sent": "If an account is associated with this email, you will receive a password reset link. Check your spam folder too.",
    "error": "We could not process your request. Check your connection and try again later.",
    "wait": "You can request another link in {{seconds}} s.",
    "passwordEyebrow": "ACCOUNT RECOVERY",
    "passwordTitle": "Set a new password.",
    "passwordDescription": "Choose a new password and confirm it to regain access.",
    "save": "Save new password"
}, setPassword: {
    submit: 'Create password',
    title: 'Create your password.',
    description:
      'Secure your account before entering your operations workspace.',
    backToSignIn: 'Back to sign in',
    signingOut: 'Signing out...',
    signOutError:
      'Your password is saved, but we could not sign you out. Please try again.',
    saving: 'Saving...',
    saveError: 'We could not save your password. Please try again.',
    successTitle: 'Your password has been saved.',
    successDescription:
      'You can use this password the next time you sign in.',
    newPassword: {
      label: 'New password',
      placeholder: 'Enter your new password',
      show: 'Show new password',
      hide: 'Hide new password',
    },
    confirmation: {
      label: 'Confirm password',
      placeholder: 'Enter your password again',
      show: 'Show password confirmation',
      hide: 'Hide password confirmation',
    },
    requirements:
      'Use at least 12 characters, including uppercase, lowercase, a number and a symbol.',
  },
  callback: {
    processingTitle: 'Checking your link...',
    processingDescription:
      'Please wait while we prepare your account setup.',
    errorTitle: 'We could not open this link.',
    errorDescription:
      'Check your connection and open the link again. If it has expired or was already used, request a new one.',
    backToSignIn: 'Back to sign in',
  },
  forgotPassword: 'Forgot password?',
  signIn: 'Sign in',
  signingIn: 'Signing in...',
  signInError:
    'We could not sign you in. Check your email, password and connection, then try again.',
  helper: 'Secure access for employees.',
  sessionLoading: 'Loading your session...',
  workspace: {
    title: 'Your operations workspace',
    description: 'You are signed in.',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    signOutError: 'We could not sign you out. Please try again.',
  },

  profileAccess: {
    loading: 'Checking your access...',
    inactiveTitle: 'Access not enabled',
    inactiveDescription:
      'Your account does not have operational access enabled. Contact your supervisor.',
    missingTitle: 'Account setup pending',
    missingDescription:
      'Your account profile has not been configured yet. Contact your supervisor.',
    errorTitle: 'We could not check your access',
    errorDescription:
      'Check your connection and try again.',
    retry: 'Check again',
  },

} as const;
export const publicOrderEn = {
  steps: { identify: 'Identify the bicycle', before: 'Before photo', after: 'After photo', review: 'Review and send' },
  photos: {
    before: 'Before', after: 'After', add: 'Take photo', retake: 'Retake',
    beforeGuide: 'Show how you found the bicycle. Retaking this photo also clears the after photo.',
    afterGuide: 'Show how you leave the bicycle and the actions completed.',
    permission: 'Allow the camera to take evidence photos.',
    capture: 'Take photo', processing: 'Preparing photo…', cancel: 'Back to form',
    error: 'Could not prepare the photo. Check camera access and try again.',
  },
  send: {
    review: 'Review and send', confirm: 'Send action', twoPhotos: 'Before and after photos attached.',
    sending: 'Sending…', retry: 'Retry sending', success: 'Action recorded. You can start another.',
    error: 'Could not confirm the action. Check your connection and location permission, then retry.',
    pending: 'This attempt is kept unchanged for a safe retry. Keep the app open until it is confirmed.',
    requirements: 'A valid bicycle ID, two photos and at least one action are required. Location is requested when sending.',
  },
  eyebrow: 'FIELD OPERATIONS',
  invalidBikeId: 'Check the bicycle ID or scan its code.',
  bikeHint: 'Scan the barcode or MOBY QR, or enter the ID manually.',
  scan: 'Scan bicycle code',
  scanShort: 'Scan',
  scanner: {
    title: 'Scan bicycle',
    close: 'Close scanner',
    loading: 'Checking camera permission',
    permission: 'Allow camera access to read the bicycle barcode. You can also enter the ID manually.',
    allow: 'Allow camera',
    settings: 'Open settings',
    permissionError: 'Could not access camera permissions. Try again or enter the ID manually.',
    cameraError: 'The camera could not start. Close the scanner and try again, or enter the ID manually.',
    invalidCode: 'Code not recognised. Scan the bicycle barcode or MOBY QR code.',
    guide: 'Point at the bicycle barcode or MOBY QR code.',
    manual: 'Enter ID manually',
    torchOn: 'Turn on light',
    torchOff: 'Turn off light',
  },
  tagline: 'Keep Dublin moving.',
  evidenceTitle: 'Before + after',
  title: 'Public Order',
  description:
    'Record the bicycle and the actions you have carried out.',
  bikeId: 'Bicycle ID',
  bikeIdPlaceholder: 'Enter ID',
  actions: 'Actions completed',
  actionsHint: 'Select at least one action.',
  kickstandPositioned: 'Kickstand positioned',
  bikeLocked: 'Bicycle locked',
  bikeRepositioned: 'Bicycle repositioned',
  notes: 'Notes (optional)',
  notesPlaceholder: 'Add relevant details',
  evidenceReminder:
    'A photo before and a photo after the action are required.',
  discardDraft: 'Discard draft',
  discardTitle: 'Discard this draft?',
  discardDescription:
    'The information you entered has not been saved.',
  keepEditing: 'Keep editing',
  discard: 'Discard',
} as const;

export const operationsEn = {
  history: {
    today: 'Today', month: 'Month', loading: 'Loading your activity…', refresh: 'Refresh',
    error: 'Could not load your activity.', retry: 'Retry', empty: 'No activity recorded for this period.',
    done: 'Done', invalid: 'Invalid',
    invalidStatus: 'Invalid: repeated bicycle on this date',
    daily: 'Daily summary',
    backToMonth: 'Back to month', openDay: 'View tasks for {{date}}',
    previousMonth: 'Previous month', nextMonth: 'Next month', currentMonth: 'Current month',
    previousPage: 'Previous page', nextPage: 'Next page', page: 'Page {{page}}',
  },
  team: 'STREET TEAM',
  tasksTitle: 'Every action counts.',
  profileEyebrow: 'YOUR SPACE',
  profileTitle: 'Part of the team.',
  profileBody: 'A few simple settings, ready for your day on the street.',
  preferences: 'Preferences',
  language: 'App language',
  account: 'Account',
  sessionNote: 'Signing out removes the unsent draft from this device.',

  home: 'Home',
  tasks: 'Tasks',
  profile: 'Profile',
  profileDescription: 'Manage your session. Your employee details will be available here soon.',
} as const;
