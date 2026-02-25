import { createAuthClient } from 'better-auth/react';
import type { ParseKeys } from 'i18next';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { GoogleIcon } from '~/design-system/icons/google-icon.tsx';
import { XIcon } from '~/design-system/icons/x-icon.tsx';

export const authClient = createAuthClient();

export type ProviderId = 'google' | 'github' | 'twitter';

type ProviderInfo = { id: ProviderId; label: string; icon: React.ComponentType<{ className?: string }> };

export const PROVIDERS: Array<ProviderInfo> = [
  { id: 'google', label: 'Google', icon: GoogleIcon },
  { id: 'github', label: 'GitHub', icon: GitHubIcon },
  { id: 'twitter', label: 'X.com', icon: XIcon },
];

type ErrorCode = keyof typeof authClient.$ERROR_CODES;

const oAuthErrors: Record<string, ParseKeys> = {
  account_already_linked_to_different_user: 'error.auth.account_already_linked_to_different_user',
};

const authErrors: Partial<Record<ErrorCode, ParseKeys>> = {
  INVALID_PASSWORD: 'error.auth.INVALID_PASSWORD',
  INVALID_EMAIL: 'error.auth.INVALID_EMAIL',
  INVALID_EMAIL_OR_PASSWORD: 'error.auth.INVALID_EMAIL_OR_PASSWORD',
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
    return oAuthErrors[error as ErrorCode] || 'error.global';
  }
  if (error.code) {
    return authErrors[error.code as ErrorCode] || 'error.global';
  }
  return 'error.global';
}
