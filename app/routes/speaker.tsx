import type { LoaderFunction } from '@remix-run/node';
import { NavLink, Outlet, useCatch, useLoaderData } from '@remix-run/react';
import cn from 'classnames';
import { Container } from '../components/layout/Container';
import { AuthUser, requireAuthUser } from '../features/auth/auth.server';
import { ButtonLink } from '../components/Buttons';

export const loader: LoaderFunction = ({ request }) => {
  const user = requireAuthUser(request);
  return user;
};

export default function SpeakerRoute() {
  const user = useLoaderData<AuthUser>();
  return (
    <>
      <header className="bg-white border-t border-gray-200">
        <Container className="pt-8 pb-4 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="flex-shrink-0">
                <img
                  className="mx-auto h-20 w-20 rounded-full"
                  src={user.picture || 'https://placekitten.com/100/100'}
                  alt=""
                />
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                <p className="text-sm font-medium text-gray-600">Welcome back,</p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{user.name}</p>
                <p className="text-sm font-medium text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0 space-x-4">
            <ButtonLink to="/speaker/settings" variant="secondary">
              Edit profile
            </ButtonLink>
          </div>
        </Container>
      </header>
      <div className="sticky top-0 z-10 pt-4 border-b bg-white bg-opacity-70 border-gray-200 backdrop-blur-xl">
        <Container>
          <nav className="-mb-px flex space-x-8">
            <NavLink to="/speaker" end className={activeTab}>
              Activity
            </NavLink>
            <NavLink to="/speaker/talks" className={activeTab}>
              Your talks
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
