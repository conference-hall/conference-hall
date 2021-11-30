import { ActionFunction, LoaderFunction, redirect, useSubmit } from 'remix';
import { Container } from '../components/Container';
import { useFirebaseSignIn } from '../firebase/useFirebaseSignIn';
import { createUserSession, getAuthUser } from '../server/auth/auth.server';

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
    <Container className="min-h-screen flex items-center justify-center">
      <button type="button" onClick={signin}>Login with google</button>
    </Container>
  )
}