import { PlusIcon } from '@heroicons/react/16/solid';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalksListFilterSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { BadgeDot } from '~/design-system/badges.tsx';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/talks.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'My talks library | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
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
            <ButtonLink to={href('/speaker/talks/new')} iconLeft={PlusIcon}>
              {t('talk.library.new')}
            </ButtonLink>
          </div>
        </List.Header>

        <List.Content aria-label={t('talk.library.list')}>
          {talks.length === 0 && (
            <EmptyState
              icon={InboxIcon}
              label={filter === 'archived' ? t('talk.library.list.no-archived') : t('talk.library.list.empty')}
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
    </Page>
  );
}
