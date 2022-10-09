import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button } from '../design-system/Buttons';
import { useFirebaseSignIn } from '../services/auth/useFirebaseSignIn';
import { getSession, sessionLogin } from '../services/auth/auth.server';
import { Container } from '../design-system/Container';
import { H1 } from '../design-system/Typography';

export const action: ActionFunction = async ({ request }) => {
  return sessionLogin(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const { uid } = await getSession(request);
  if (uid) return redirect('/');
  return null;
};

export default function Login() {
  const submit = useSubmit();
  const [isSigning, signin] = useFirebaseSignIn(submit);

  return (
    <Container className="flex flex-col items-center justify-center py-16 sm:py-64">
      <H1 className="text-center text-4xl font-black">Log in to Conference Hall</H1>
      {isSigning ? (
        <p className="mt-12 space-y-4 p-8">Singing...</p>
      ) : (
        <div className="mt-12 max-w-sm space-y-4 p-8">
          <Button type="button" block onClick={signin}>
            Continue with Google
          </Button>
          <Button type="button" block onClick={signin}>
            Continue with GitHub
          </Button>
          <Button type="button" block onClick={signin}>
            Continue with Twitter
          </Button>
        </div>
      )}
    </Container>
  );
}
