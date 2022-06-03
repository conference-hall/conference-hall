import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button } from '../components/Buttons';
import { useFirebaseSignIn } from '../services/firebase/useFirebaseSignIn';
import { createUserSession, getAuthUser } from '../features/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return createUserSession(request)
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request)
  if (user) return redirect('/')
  return null
}

export default function Login() {
  const submit = useSubmit()
  const [isSigning, signin] = useFirebaseSignIn(submit)

  if (isSigning) return null
  
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] pb-64 max-w-3xl mx-auto">
      <h1 className="text-6xl text-center font-black">Log in to Conference Hall</h1>
      <div className="mt-12 p-8 space-y-4 max-w-sm">
        <Button type="button" block onClick={signin}>Continue with Google</Button>
        <Button type="button" block onClick={signin}>Continue with GitHub</Button>
        <Button type="button" block onClick={signin}>Continue with Twitter</Button>
      </div>
    </div>
  )
}