import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  return json({});
};

export default function CampaignTemplateSelection() {
  return (
    <div>
      <ButtonLink to="my-template" iconRight={ArrowRightIcon}>
        Continue
      </ButtonLink>
    </div>
  );
}
