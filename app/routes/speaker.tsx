import type { LoaderFunction } from '@remix-run/node';
import { NavLink, Outlet, useCatch } from '@remix-run/react';
import cn from 'classnames';
import { Container } from '../design-system/Container';
import { requireAuthUser } from '../services/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuthUser(request);
  return user;
};

export default function SpeakerRoute() {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white pt-4">
        <Container>
          <nav className="-mb-px flex space-x-8">
            <NavLink to="/speaker" end className={activeTab}>
              Activity
            </NavLink>
            <NavLink to="/speaker/talks" className={activeTab}>
              Talks
            </NavLink>
            <NavLink to="/speaker/settings" className={activeTab}>
              Settings
            </NavLink>
          </nav>
        </Container>
      </div>
      <Outlet />
    </>
  );
}

const activeTab = ({ isActive }: { isActive: boolean }) => {
  return cn('whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm', {
    'border-indigo-500 text-indigo-600': isActive,
    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive,
  });
};

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
