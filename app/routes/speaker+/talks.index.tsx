import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalksListFilterSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { BadgeDot } from '~/design-system/badges.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/talks.index.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'My talks library | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const filter = TalksListFilterSchema.safeParse(searchParams.get('filter'));
  return TalksLibrary.of(userId).list(filter.data);
};

export default function SpeakerTalksRoute({ loaderData: talks }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  return (
    <Page>
      <H1 srOnly>Talk library</H1>

      <List>
        <List.Header>
          <Text weight="semibold">{`${talks.length} talks`}</Text>
          <SearchParamSelector
            param="filter"
            defaultValue="active"
            selectors={[
              { label: 'Archived', value: 'archived' },
              { label: 'Active', value: 'active' },
              { label: 'All', value: 'all' },
            ]}
          />
        </List.Header>
        <List.Content aria-label="Talks list">
          {talks.length === 0 && (
            <EmptyState
              icon={InboxIcon}
              label={filter === 'archived' ? 'No talks archived.' : 'No talks found.'}
              noBorder
            />
          )}
          {talks.map((talk) => (
            <List.RowLink key={talk.id} to={talk.id} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {talk.title}
                </Text>
                <Text size="xs" variant="secondary">
                  {talk.speakers.length ? `by ${talk.speakers.map((a) => a.name).join(', ')}` : null}
                </Text>
              </div>
              <div className="flex items-center gap-4">
                {talk.archived ? <BadgeDot color="blue">Archived</BadgeDot> : null}
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </List.RowLink>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
