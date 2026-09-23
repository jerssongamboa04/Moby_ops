export const authEn = {
  languageSelector: 'Language selector',
  eyebrow: 'MOBY STREET TEAM',
  title: 'Keep Dublin moving.',
  description: 'Sign in to access your operations workspace.',
  email: {
    label: 'Email',
    placeholder: 'name@moby.ie',
  },
  password: {
    label: 'Password',
    placeholder: 'Enter your password',
    show: 'Show password',
    hide: 'Hide password',
  }, setPassword: {
    submit: 'Create password',
    eyebrow: 'ACCOUNT SETUP',
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
    processingTitle: 'Checking your invitation...',
    processingDescription:
      'Please wait while we prepare your account setup.',
    errorTitle: 'We could not complete your invitation.',
    errorDescription:
      'Check your connection and open the invitation again. If the problem continues, contact your supervisor.',
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
  start: 'New Public Order',
  title: 'Public Order',
  description:
    'Record the bicycle and the actions you have carried out.',
  bikeId: 'Bicycle ID',
  bikeIdPlaceholder: 'Enter the bicycle code',
  actions: 'Actions completed',
  actionsHint: 'Select at least one action.',
  kickstandPositioned: 'Kickstand positioned',
  bikeLocked: 'Bicycle locked',
  bikeRepositioned: 'Bicycle repositioned',
  notes: 'Notes (optional)',
  notesPlaceholder: 'Add relevant details',
  evidenceReminder:
    'A photo before and a photo after the action are required.',
  back: 'Back',
  discardTitle: 'Discard this draft?',
  discardDescription:
    'The information you entered has not been saved.',
  keepEditing: 'Keep editing',
  discard: 'Discard',
} as const;