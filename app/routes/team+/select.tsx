import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { Card, CardLink } from '~/design-system/layouts/card.tsx';
import { Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/routes/__components/use-user.tsx';

import { FullscreenPage } from '../__components/fullscreen-page.tsx';

export const meta = mergeMeta(() => [{ title: 'Request access | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function RequestAccessNextRoute() {
  const { user } = useUser();

  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title title="Welcome to Conference Hall Team!" />

      <Card className="p-8 md:p-12">
        <Text weight="semibold" size="base">
          Select or create a team:
        </Text>

        <ul className="flex flex-col gap-4 mt-6">
          {user?.teams.map((team) => (
            <CardLink
              key={team.slug}
              as="li"
              to={`/team/${team.slug}`}
              className="p-8 flex items-center justify-between"
            >
              <Text size="l" weight="semibold" truncate>
                {team.name}. {team.name}. {team.name}. {team.name}.
              </Text>
              <ChevronRightIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            </CardLink>
          ))}

          <CardLink as="li" to="/team/new" className="p-8 flex items-center gap-8">
            <PlusIcon className="h-6 w-6" aria-hidden="true" />
            <Text size="l" weight="semibold">
              Create a new team.
            </Text>
          </CardLink>
        </ul>
      </Card>
    </FullscreenPage>
  );
}
