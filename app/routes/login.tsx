import { ActionFunction, LoaderFunction, redirect, useSubmit } from 'remix';
import { Button } from '../components/Buttons';
import { Container } from '../components/layout/Container';
import { useFirebaseSignIn } from '../services/firebase/useFirebaseSignIn';
import { createUserSession, getAuthUser } from '../features/auth/auth.server';

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
    <Container className="py-8 flex justify-center">
      <Button type="button" onClick={signin}>Login with Google</Button>
    </Container>
  )
}