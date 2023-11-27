import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';

import { useTeam } from '../../$team.tsx';
import { useTeamEvent } from '../_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function EventProposalEmails() {
  const { user } = useUser();
  const { team } = useTeam();
  const { event } = useTeamEvent();

  return <Outlet context={{ user, team, event }} />;
}
