import { useCallback } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Container } from '~/design-system/layouts/Container';
import { H1 } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { createSession, getSessionUid } from '~/libs/auth/cookies';
import { getClientAuth } from '~/libs/auth/firebase';

export const loader = async ({ request }: LoaderArgs) => {
  const uid = await getSessionUid(request);
  if (uid) throw redirect('/');
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  return createSession(request);
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { submit } = useFetcher();

  const signIn = useCallback(() => {
    const clientAuth = getClientAuth();
    signInWithPopup(clientAuth, new GoogleAuthProvider())
      .then(async (credentials) => {
        const token = await credentials.user.getIdToken();
        submit({ token, redirectTo }, { method: 'post', action: '/login' });
      })
      .catch((error) => {
        // TODO: Handle errors
        console.error(error);
      });
  }, [submit, redirectTo]);

  return (
    <Container className="flex flex-col items-center justify-center py-16 sm:py-64">
      <H1>Log in to Conference Hall</H1>
      <div className="mt-12 max-w-sm space-y-4 p-8">
        <Button type="button" block onClick={signIn}>
          Continue with Google
        </Button>
        <Button type="button" block onClick={signIn}>
          Continue with GitHub
        </Button>
        <Button type="button" block onClick={signIn}>
          Continue with Twitter
        </Button>
      </div>
    </Container>
  );
}
