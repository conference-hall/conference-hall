import * as Firebase from 'firebase/auth';
import { useEffect } from 'react';
import { useFetcher } from 'react-router';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

type AuthProvidersResultProps = {
  redirectTo: string;
  setError: (error: string) => void;
};

export function AuthProvidersResult({ redirectTo, setError }: AuthProvidersResultProps) {
  const { submit } = useFetcher();

  useEffect(() => {
    setError('');
    Firebase.getRedirectResult(getClientAuth())
      .then(async (credentials) => {
        if (!credentials) {
          setError('Sign in failed. Please try again.');
          return;
        }
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
      })
      .catch((error) => setError(error.message));
  }, [submit, redirectTo, setError]);

  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingIcon className="size-10" />
    </div>
  );
}
