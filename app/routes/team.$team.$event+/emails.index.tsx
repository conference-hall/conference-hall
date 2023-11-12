import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { Link } from '~/design-system/Links.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  return json({});
};

export default function EmailCampaigns() {
  return (
    <PageContent>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <H1>Email campaigns</H1>
        <ButtonLink to="new" iconLeft={PlusIcon}>
          New campaign
        </ButtonLink>
      </div>
      <div>
        <Link to="my-campaign">This is my campaign</Link>
      </div>
    </PageContent>
  );
}
