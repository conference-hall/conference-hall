import { createContext, type MiddlewareFunction, type RouterContextProvider, redirect } from 'react-router';
import type { AuthenticatedUser } from '../types/user.types.ts';
import { UserAccount } from '../user/user-account.server.ts';
import { destroySession, getAuthSession } from './session.ts';

const authContext = createContext<AuthenticatedUser | null>();

export const authMiddleware: MiddlewareFunction<Response> = async ({ request, context }) => {
  const session = await getAuthSession(request);

  const user = await UserAccount.getByUid(session?.uid);
  if (session?.uid && !user) await destroySession(request);

  context.set(authContext, user);
};

export function getAuthUser(context: Readonly<RouterContextProvider>) {
  return context.get(authContext);
}

const protectedRouteContext = createContext<AuthenticatedUser>();

export const requiredAuthMiddleware: MiddlewareFunction<Response> = async ({ request, context }) => {
  const user = getAuthUser(context);

  if (!user) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  context.set(protectedRouteContext, user);
};

export function getRequiredAuthUser(context: Readonly<RouterContextProvider>) {
  return context.get(protectedRouteContext);
}
