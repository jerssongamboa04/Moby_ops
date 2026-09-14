import { create } from 'zustand';

export type AuthCallbackStatus =
  | 'idle'
  | 'processing'
  | 'error'
  | 'success';

type AuthCallbackState = {
  status: AuthCallbackStatus;
  startProcessing: () => void;
  markAsError: () => void;
  markAsSuccess: () => void;
  reset: () => void;
};

export const useAuthCallbackStore = create<AuthCallbackState>()(
  (set) => ({
    status: 'idle',

    startProcessing: () => {
      set({ status: 'processing' });
    },

    markAsError: () => {
      set({ status: 'error' });
    },

    markAsSuccess: () => {
      set({ status: 'success' });
    },

    reset: () => {
      set({ status: 'idle' });
    },
  })
);