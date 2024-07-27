import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { AvatarGroup } from '~/design-system/avatar.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

export const meta = mergeMeta(() => [{ title: 'My talks library | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get('archived') === 'true';
  const talks = await TalksLibrary.of(userId).list({ archived });
  return json(talks);
};

export default function SpeakerTalksRoute() {
  const talks = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const archived = searchParams.get('archived') === 'true';

  return (
    <Page>
      <h1 className="sr-only">Talks library</h1>
      <List>
        <List.Header>
          <Text weight="semibold">{`${talks.length} talks`}</Text>
          <SearchParamSelector
            param="archived"
            defaultValue="false"
            selectors={[
              { label: 'Active', value: 'false' },
              { label: 'Archived', value: 'true' },
            ]}
          />
        </List.Header>
        <List.Content aria-label="Talks list">
          {talks.length === 0 && (
            <EmptyState icon={InboxIcon} label={archived ? 'No talks archived.' : 'No talks found.'} noBorder />
          )}
          {talks.map((talk) => (
            <List.RowLink key={talk.id} to={talk.id} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="base" weight="semibold" mb={1} truncate>
                  {talk.title}
                </Text>
                <AvatarGroup avatars={talk.speakers} displayNames />
              </div>
              <div>
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </List.RowLink>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
