import { createContext, type MiddlewareFunction, redirect } from 'react-router';
import { auth } from '../../auth.server.ts';
import type { AuthenticatedUser } from '../types/user.types.ts';
import { UserAccount } from '../user/user-account.server.ts';

export const OptionalAuthContext = createContext<AuthenticatedUser | null>();

export const optionalAuth: MiddlewareFunction<Response> = async ({ request, context }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const userId = session?.user.id;
  if (!userId) {
    context.set(OptionalAuthContext, null);
    return;
  }

  // todo(cache): can be cached to improve performances (called on each request)
  const user = await UserAccount.for(userId).get();
  if (!user) throw await auth.api.signOut({ headers: request.headers });
  context.set(OptionalAuthContext, user);
};

export const RequireAuthContext = createContext<AuthenticatedUser>();

export const requireAuth: MiddlewareFunction<Response> = async ({ request, context }) => {
  const user = context.get(OptionalAuthContext);

  if (!user) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  context.set(RequireAuthContext, user);
};
