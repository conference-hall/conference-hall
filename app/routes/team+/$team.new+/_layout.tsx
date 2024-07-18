import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/user-team.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';

import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const team = await UserTeam.for(userId, params.team).get();
  return json(team);
};

export default function EventCreationLayout() {
  const { team } = useTeam();

  return (
    <FullscreenPage navbar="default" compact>
      <Outlet context={{ team }} />
    </FullscreenPage>
  );
}
