import { Outlet } from 'react-router';
import { OptionalAuthContext, optionalAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/app-layout.ts';
import { UserProvider } from './components/user-context.tsx';

export const middleware = [optionalAuth];

export const loader = async ({ context }: Route.LoaderArgs) => {
  return { user: context.get(OptionalAuthContext) };
};

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <UserProvider user={loaderData.user}>
      <Outlet />
    </UserProvider>
  );
}
