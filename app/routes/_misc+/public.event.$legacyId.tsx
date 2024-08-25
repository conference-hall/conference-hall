import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { db } from 'prisma/db.server.ts';
import invariant from 'tiny-invariant';
import { EventNotFoundError } from '~/libs/errors.server.ts';

// Redirect Conference Hall beta event URLs
export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.legacyId, 'Invalid legacy id');

  const event = await db.event.findFirst({ where: { migrationId: params.legacyId } });
  if (!event) {
    throw new EventNotFoundError();
  }

  return redirect(`/${event.slug}`, 301);
};

export default function RedirectLegacyRoute() {
  return null;
}
