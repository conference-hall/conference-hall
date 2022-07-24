import { useEffect, useState } from 'react';
import {
  SubmitFunction,
  useSearchParams,
  useTransition,
} from '@remix-run/react';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  inMemoryPersistence,
  signInWithRedirect,
} from 'firebase/auth';

type FirebaseSignReturn = [boolean, () => Promise<void>];

export function useFirebaseSignIn(
  onSubmit: SubmitFunction
): FirebaseSignReturn {
  const transition = useTransition();
  const [isAuthenticating, setAuthenticating] = useState(true);

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    getRedirectResult(getAuth()).then(async (credentials) => {
      if (credentials) {
        const tokenId = await credentials.user.getIdToken();
        onSubmit({ tokenId, redirectTo }, { method: 'post', replace: true });
      } else {
        console.log('No credentials');
      }
      setAuthenticating(false);
    });
  }, [redirectTo]);

  const signin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const auth = getAuth();
    await setPersistence(auth, inMemoryPersistence);
    await signInWithRedirect(auth, provider);
  };

  return [
    isAuthenticating ||
      transition.state === 'submitting' ||
      transition.state === 'loading',
    signin,
  ];
}
