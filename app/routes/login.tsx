import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button } from '../design-system/Buttons';
import { useFirebaseSignIn } from '../services/auth/useFirebaseSignIn';
import { isSessionValid, sessionLogin } from '../services/auth/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return sessionLogin(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await isSessionValid(request);
  if (uid) return redirect('/');
  return null;
};

export default function Login() {
  const submit = useSubmit();
  const [isSigning, signin] = useFirebaseSignIn(submit);

  if (isSigning) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-3xl flex-col items-center justify-center pb-64">
      <h1 className="text-center text-6xl font-black">Log in to Conference Hall</h1>
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
    </div>
  );
}
