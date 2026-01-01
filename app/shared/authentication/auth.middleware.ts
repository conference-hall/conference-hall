import { createContext, type MiddlewareFunction, redirect } from 'react-router';
import type { AuthenticatedUser } from '../types/user.types.ts';
import { UserAccount } from '../user/user-account.server.ts';
import { destroySession, getSessionUid } from './session.ts';

export const OptionalAuthContext = createContext<AuthenticatedUser | null>();

export const optionalAuth: MiddlewareFunction<Response> = async ({ request, context }) => {
  const sessionUid = await getSessionUid(request);

  // todo(cache): can be cached to improve performances (called on each request)
  const user = await UserAccount.getByUid(sessionUid);
  if (sessionUid && !user) await destroySession(request);

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
