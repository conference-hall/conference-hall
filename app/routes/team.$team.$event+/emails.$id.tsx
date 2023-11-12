import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { IconButtonLink } from '~/design-system/IconButtons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  return json({});
};

export default function EmailCampaign() {
  return (
    <>
      <PageContent>
        <div className="flex items-center gap-4">
          <IconButtonLink
            to=".."
            icon={ArrowLeftIcon}
            variant="secondary"
            relative="path"
            label="Go back to campaigns"
          />
          <H1>My campaign</H1>
        </div>
      </PageContent>
    </>
  );
}
