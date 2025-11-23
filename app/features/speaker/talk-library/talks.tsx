import { PlusIcon } from '@heroicons/react/16/solid';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { BadgeDot } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/talks.ts';
import { TalksListFilterSchema } from './services/talks-library.schema.server.ts';
import { TalksLibrary } from './services/talks-library.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'My talks library | Conference Hall' }]);
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const { searchParams } = new URL(request.url);
  const filter = TalksListFilterSchema.safeParse(searchParams.get('filter'));
  return TalksLibrary.of(userId).list(filter.data);
};

export default function SpeakerTalksRoute({ loaderData: talks }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  return (
    <Page>
      <H1 srOnly>{t('talk.library.heading')}</H1>

      {talks.length === 0 && filter !== 'archived' ? (
        <EmptyState icon={InboxIcon} label={t('talk.library.list.empty')}>
          <Button to={href('/speaker/talks/new')} iconLeft={PlusIcon}>
            {t('talk.library.new')}
          </Button>
        </EmptyState>
      ) : (
        <List>
          <List.Header>
            <Text weight="semibold">{t('talk.library.count', { count: talks.length })}</Text>
            <div className="flex items-center gap-4">
              <SearchParamSelector
                param="filter"
                defaultValue="active"
                className="hidden sm:flex"
                selectors={[
                  { value: 'archived', label: t('common.archived') },
                  { value: 'active', label: t('common.active') },
                  { value: 'all', label: t('common.all') },
                ]}
              />
              <Button to={href('/speaker/talks/new')} iconLeft={PlusIcon}>
                {t('talk.library.new')}
              </Button>
            </div>
          </List.Header>

          <List.Content aria-label={t('talk.library.list')}>
            {talks.map((talk) => (
              <List.RowLink key={talk.id} to={talk.id} className="flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <Text size="s" weight="medium" truncate>
                    {talk.title}
                  </Text>
                  <Text size="xs" variant="secondary">
                    {t('common.by', { names: talk.speakers.map((a) => a.name) })}
                  </Text>
                </div>
                <div className="flex items-center gap-4">
                  {talk.archived ? <BadgeDot color="blue">{t('common.archived')}</BadgeDot> : null}
                  <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                </div>
              </List.RowLink>
            ))}
          </List.Content>
        </List>
      )}
    </Page>
  );
}
