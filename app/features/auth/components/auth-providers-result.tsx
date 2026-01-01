import * as Firebase from 'firebase/auth';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { getFirebaseError } from '~/shared/authentication/firebase.errors.ts';
import { getClientAuth } from '~/shared/authentication/firebase.ts';

type AuthProvidersResultProps = {
  redirectTo: string;
  setError: (error: string) => void;
};

export function AuthProvidersResult({ redirectTo, setError }: AuthProvidersResultProps) {
  const { t } = useTranslation();
  const { submit } = useFetcher();

  useEffect(() => {
    setError('');
    Firebase.getRedirectResult(getClientAuth())
      .then(async (credentials) => {
        if (!credentials) {
          setError(t('auth.signin.errors.failed'));
          return;
        }
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
      })
      .catch((error) => setError(getFirebaseError(error, t)));
  }, [submit, redirectTo, setError, t]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingIcon className="size-10" />
    </div>
  );
}
