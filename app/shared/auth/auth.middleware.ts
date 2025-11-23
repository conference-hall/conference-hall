import { createContext, type MiddlewareFunction, type RouterContextProvider, redirect } from 'react-router';
import { getAuthSession } from './session.ts';

type UserSession = { userId: string; uid: string };

const sessionContext = createContext<UserSession | null>();

// todo(middleware): add tests
export const sessionMiddleware: MiddlewareFunction<Response> = async ({ request, context }) => {
  const session = await getAuthSession(request);
  context.set(sessionContext, session);
};

export function getSession(context: Readonly<RouterContextProvider>) {
  return context.get(sessionContext);
}

const protectedRouteContext = createContext<UserSession>();

// todo(middleware): add tests
export const protectedRouteMiddleware: MiddlewareFunction<Response> = async ({ request, context }) => {
  const session = getSession(context);

  if (!session) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  context.set(protectedRouteContext, session);
};

export function getProtectedSession(context: Readonly<RouterContextProvider>) {
  return context.get(protectedRouteContext);
}
