import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  return json({});
};

export default function CampaignTemplateSelection() {
  const { team, event } = useParams();

  return (
    <div>
      <ButtonLink to={`/team/${team}/${event}/emails`} iconRight={PaperAirplaneIcon}>
        Launch email campaign
      </ButtonLink>
    </div>
  );
}
