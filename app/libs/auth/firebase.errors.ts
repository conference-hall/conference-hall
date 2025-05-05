import type { AuthError } from 'firebase/auth';
import type { TFunction } from 'i18next';

const EXPIRED_ACTION_CODE = 'auth/expired-action-code';
const INVALID_ACTION_CODE = 'auth/invalid-action-code';
const USER_DISABLED = 'auth/user-disabled';
const USER_NOT_FOUND = 'auth/user-not-found';
const INVALID_EMAIL = 'auth/invalid-email';
const INVALID_CREDENTIAL = 'auth/invalid-credential';
const EMAIL_ALREADY_EXISTS = 'auth/email-already-exists';
const EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use';
const WRONG_PASSWORD = 'auth/wrong-password';
const WEAK_PASSWORD = 'auth/weak-password';
const ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = 'auth/account-exists-with-different-credential';
const CREDENTIAL_ALREADY_IN_USE = 'auth/credential-already-in-use';

export function getFirebaseError(error: any, t: TFunction): string {
  const { code } = error as AuthError;
  switch (code) {
    case USER_DISABLED:
    case USER_NOT_FOUND:
    case INVALID_EMAIL:
    case INVALID_CREDENTIAL:
    case EMAIL_ALREADY_EXISTS:
    case EMAIL_ALREADY_IN_USE:
    case WRONG_PASSWORD:
      return t('error.auth.email-password-incorrect');
    case WEAK_PASSWORD:
      return t('error.auth.weak-password');
    case ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      return t('error.auth.account-exists');
    case CREDENTIAL_ALREADY_IN_USE:
      return t('error.auth.method-already-in-use');
    case EXPIRED_ACTION_CODE:
      return t('error.auth.expired-action-code');
    case INVALID_ACTION_CODE:
      return t('error.auth.invalid-action-code');
    default:
      console.error(error.code);
      return t('error.global');
  }
}
