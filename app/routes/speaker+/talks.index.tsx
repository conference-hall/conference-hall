import { ChevronRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { AvatarGroup } from '~/design-system/Avatar.tsx';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { List } from '~/design-system/list/List.tsx';
import { SearchParamSelector } from '~/design-system/navigation/SearchParamSelector.tsx';
import { Text } from '~/design-system/Typography.tsx';
import { TalksLibrary } from '~/domains/speaker-talks-library/TalksLibrary.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

export const meta = mergeMeta(() => [{ title: 'Talks library | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get('archived') === 'true';
  const talks = await TalksLibrary.of(userId).list({ archived });
  return json(talks);
};

export default function SpeakerTalksRoute() {
  const talks = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeaderTitle title="Your talks library" subtitle="This is your talks library.">
        <ButtonLink iconLeft={PlusIcon} to="/speaker/talks/new">
          New talk
        </ButtonLink>
      </PageHeaderTitle>

      <PageContent className="space-y-8">
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
            {talks.length === 0 && <EmptyState icon={InboxIcon} label="No talks found." />}
            {talks.map((talk) => (
              <List.RowLink key={talk.id} to={talk.id} className="flex justify-between items-center">
                <div>
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
      </PageContent>
    </>
  );
}
