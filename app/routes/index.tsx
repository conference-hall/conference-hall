import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '../components/Container';
import { AuthUser, requireAuthUser, requireUserSession } from '../server/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserSession(request);
  return requireAuthUser(request)
};

export default function IndexRoute() {
  const user = useLoaderData<AuthUser>()

  return (
    <Container>
      <p>{user.name}</p>
      <form action="/logout" method="post">
        <button type="submit">Logout</button>
      </form>
    </Container>
  );
}
