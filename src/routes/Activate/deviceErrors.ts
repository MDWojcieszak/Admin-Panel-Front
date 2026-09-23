import { getApiErrorMessage, getApiErrorStatus } from '~/utils/apiError';

export type DeviceErrorKind = 'not-found' | 'expired' | 'used' | 'rate-limited' | 'unknown';

export type DeviceError = {
  kind: DeviceErrorKind;
  message: string;
  /** Whether re-entering a code could plausibly help, or the app has to start over. */
  retryable: boolean;
};

/**
 * Maps the backend's device-flow failures onto something a person can act on.
 * The distinction that matters is whether the fix is here (retype the code) or
 * back in the desktop app (start a new authorization).
 */
export const describeDeviceError = (e: unknown): DeviceError => {
  const status = getApiErrorStatus(e);
  const raw = getApiErrorMessage(e, '');

  if (status === 404) {
    return {
      kind: 'not-found',
      message: 'We couldn’t find that code. Check it for a typo and try again.',
      retryable: true,
    };
  }

  // Short codes make guessing the obvious attack, so the backend caps attempts.
  // Retrying automatically would just burn through the window — let the user wait.
  if (status === 429) {
    return {
      kind: 'rate-limited',
      message: 'Too many attempts. Wait a minute before trying again.',
      retryable: true,
    };
  }

  if (status === 400 && raw.includes('expired')) {
    return {
      kind: 'expired',
      message: 'This code has expired. Click “Authorize” in the app again to get a new one.',
      retryable: false,
    };
  }

  if (status === 400 && raw.includes('already been used')) {
    return {
      kind: 'used',
      message: 'This code has already been used.',
      retryable: false,
    };
  }

  return {
    kind: 'unknown',
    message: raw || 'Something went wrong. Try again in a moment.',
    retryable: true,
  };
};
