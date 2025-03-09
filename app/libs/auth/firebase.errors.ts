import type { AuthError } from 'firebase/auth';

const EXPIRED_ACTION_CODE = 'auth/expired-action-code';
const INVALID_ACTION_CODE = 'auth/invalid-action-code';
const USER_DISABLED = 'auth/user-disabled';
const USER_NOT_FOUND = 'auth/user-not-found';
const INVALID_EMAIL = 'auth/invalid-email';
const EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use';
const WRONG_PASSWORD = 'auth/wrong-password';
const WEAK_PASSWORD = 'auth/weak-password';
const ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = 'auth/account-exists-with-different-credential';

export function getFirebaseError(error: any): string {
  const { code } = error as AuthError;
  switch (code) {
    case EXPIRED_ACTION_CODE:
      return 'Your email link has expired. Please try resetting your password again.';
    case INVALID_ACTION_CODE:
      return 'Your email link was invalid or has already been used. Please try resetting your password again.';
    case USER_DISABLED:
    case USER_NOT_FOUND:
    case INVALID_EMAIL:
    case EMAIL_ALREADY_IN_USE:
    case WRONG_PASSWORD:
      return 'Email or password is incorrect';
    case WEAK_PASSWORD:
      return 'Your password is not secure enough';
    case ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      return 'You need to connect your account with the provider you used to sign up';
    default:
      console.error('Unhandled error code:', code);
      return 'An error occurred. Please try again.';
  }
}
