import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { Page } from '~/design-system/layouts/page';
import { H2, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return null;
};

export default function OverviewRoute() {
  return (
    <Page>
      <H2>Overview</H2>
      <Text>WIP</Text>
    </Page>
  );
}
