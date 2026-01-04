import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { href, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';

type Props = {
  team: string;
  event: string;
  current: number;
  total: number;
  reviewed: number;
  next?: string;
  previous?: string;
};

export function NavigationHeader({ team, event, current, total, reviewed, next, previous }: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const previousPath = previous
    ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: previous })
    : undefined;

  const nextPath = next ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: next }) : undefined;

  return (
    <header className="flex items-center justify-between gap-4 pb-4 lg:-mt-4">
      <nav className="flex grow items-center justify-between gap-2 sm:justify-start lg:gap-4">
        <Button
          to={{ pathname: previousPath, search: searchParams.toString() }}
          icon={ChevronLeftIcon}
          label={t('event-management.proposal-page.previous')}
          variant="secondary"
          size="sm"
          disabled={!previousPath}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <Button
          to={{ pathname: nextPath, search: searchParams.toString() }}
          icon={ChevronRightIcon}
          label={t('event-management.proposal-page.next')}
          variant="secondary"
          size="sm"
          disabled={!nextPath}
        />
      </nav>

      <div className="flex items-center gap-8">
        <ReviewsProgress reviewed={reviewed} total={total} />
      </div>
    </header>
  );
}
