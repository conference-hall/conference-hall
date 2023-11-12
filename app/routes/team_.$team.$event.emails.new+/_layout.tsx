import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useNavigate, useParams } from '@remix-run/react';
import { useHotkeys } from 'react-hotkeys-hook';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  return null;
};

export default function NewEmailCampaign() {
  const navigate = useNavigate();
  const { team, event } = useParams();
  const closePath = `/team/${team}/${event}/emails`;
  useHotkeys('escape', () => navigate({ pathname: closePath }));

  return (
    <>
      <PageHeaderTitle
        title="New campaign"
        subtitle="Use a pre-defined email campaign to communicate CFP results to the speakers."
        closeTo={closePath}
      />
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
