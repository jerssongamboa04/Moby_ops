import { create } from 'zustand';

export type AuthCallbackStatus =
  | 'idle'
  | 'processing'
  | 'error'
  | 'success';

type AuthCallbackState = {
  status: AuthCallbackStatus;
  recovery: boolean;
  startProcessing: () => void;
  markAsError: () => void;
  markAsSuccess: (type?: string | null) => void;
  reset: () => void;
};

export const useAuthCallbackStore = create<AuthCallbackState>()(
  (set) => ({
    status: 'idle',
    recovery: false,

    startProcessing: () => {
      set({ status: 'processing', recovery: false });
    },

    markAsError: () => {
      set({ status: 'error' });
    },

    markAsSuccess: (type) => {
      set({ status: 'success', recovery: type === 'recovery' });
    },

    reset: () => {
      set({ status: 'idle', recovery: false });
    },
  })
);