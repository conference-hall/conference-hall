import { useEffect } from 'react';
import type { SubmitFunction } from '@remix-run/react';
import { useSearchParams, useNavigation } from '@remix-run/react';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  inMemoryPersistence,
  signInWithRedirect,
} from 'firebase/auth';

type FirebaseSignReturn = [boolean, () => Promise<void>];

export function useFirebaseSignIn(onSubmit: SubmitFunction): FirebaseSignReturn {
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRedirecting = Boolean(searchParams.get('redirecting'));
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    getRedirectResult(getAuth())
      .then(async (credentials) => {
        if (!credentials) return;
        const tokenId = await credentials.user.getIdToken();
        onSubmit({ tokenId, redirectTo }, { method: 'post', replace: true });
      })
      .catch((error) => {
        setSearchParams(new URLSearchParams({ redirectTo }));
        console.error(error);
      });
  }, [redirectTo, onSubmit, setSearchParams]);

  const signin = async () => {
    setSearchParams(new URLSearchParams({ redirecting: 'true', redirectTo }));
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const auth = getAuth();
    await setPersistence(auth, inMemoryPersistence);
    await signInWithRedirect(auth, provider).catch((error) => {
      setSearchParams(new URLSearchParams({ redirectTo }));
      console.error(error);
    });
  };

  return [isRedirecting || state === 'submitting', signin];
}
