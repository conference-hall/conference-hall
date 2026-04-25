import type { ParseKeys } from 'i18next';

const oAuthErrors: Record<string, ParseKeys> = {
  account_already_linked_to_different_user: 'error.auth.account_already_linked_to_different_user',
};

const authErrors: Partial<Record<string, ParseKeys>> = {
  INVALID_CAPTCHA: 'error.auth.INVALID_CAPTCHA',
  INVALID_EMAIL: 'error.auth.INVALID_EMAIL',
  INVALID_EMAIL_OR_PASSWORD: 'error.auth.INVALID_EMAIL_OR_PASSWORD',
  INVALID_PASSWORD: 'error.auth.INVALID_PASSWORD',
  INVALID_TOKEN: 'error.auth.INVALID_TOKEN',
  EMAIL_NOT_VERIFIED: 'error.auth.EMAIL_NOT_VERIFIED',
  PASSWORD_TOO_SHORT: 'error.auth.PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'error.auth.PASSWORD_TOO_LONG',
  SESSION_EXPIRED: 'error.auth.SESSION_EXPIRED',
  EMAIL_ALREADY_VERIFIED: 'error.auth.EMAIL_ALREADY_VERIFIED',
  VALIDATION_ERROR: 'error.auth.VALIDATION_ERROR',
};

export function getAuthError(error: { code?: string | null; message?: string } | string): ParseKeys {
  if (typeof error === 'string') {
    return oAuthErrors[error] || 'error.global';
  }
  if (error.code) {
    return authErrors[error.code] || 'error.global';
  }
  return 'error.global';
}
