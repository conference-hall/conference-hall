import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useCatch } from '@remix-run/react';
import { SpeakerTabs } from '~/components/SpeakerTabs';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  return sessionRequired(request);
};

export default function SpeakerRoute() {
  return (
    <>
      <SpeakerTabs />
      <Outlet />
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
