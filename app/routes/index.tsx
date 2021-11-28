import { LoaderFunction, useLoaderData } from 'remix';
import { AuthUser, requireAuthUser, requireUserSession } from '../server/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserSession(request);
  return requireAuthUser(request)
};

export default function IndexRoute() {
  const user = useLoaderData<AuthUser>()

  return (
    <div>
      <h1>Conference Hall</h1>
      <p>{user.name}</p>
      <form action="/logout" method="post">
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
