import {
    useAuthCallbackStore,
} from '../src/features/auth/store/auth-callback-store';

describe('auth callback store', () => {
  beforeEach(() => {
    useAuthCallbackStore.getState().reset();
  });

  test('starts idle without processing an invitation', () => {
    expect(
      useAuthCallbackStore.getState().status
    ).toBe('idle');
  });

  test('allows a new attempt after a processing error', () => {
    useAuthCallbackStore.getState().startProcessing();

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('processing');

    useAuthCallbackStore.getState().markAsError();

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('error');

    useAuthCallbackStore.getState().startProcessing();

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('processing');
  });

  test('records success and clears the completed attempt', () => {
    useAuthCallbackStore.getState().startProcessing();
    useAuthCallbackStore.getState().markAsSuccess();

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('success');

    useAuthCallbackStore.getState().reset();

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('idle');
  });
});