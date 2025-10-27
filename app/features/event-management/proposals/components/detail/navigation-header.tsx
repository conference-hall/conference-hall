import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import { ButtonIcon } from '~/design-system/button-icon.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';

type Props = { current: number; total: number; reviewed: number; nextId?: string; previousId?: string };

export function NavigationHeader({ current, total, reviewed, nextId, previousId }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const search = searchParams.toString();

  const previousPath =
    previousId !== undefined ? `/team/${params.team}/${params.event}/proposals/${previousId}` : undefined;
  const nextPath = nextId !== undefined ? `/team/${params.team}/${params.event}/proposals/${nextId}` : undefined;

  return (
    <header className="flex justify-between items-center gap-4 pb-4 lg:-mt-4">
      <nav className="flex items-center justify-between sm:justify-start grow gap-2 lg:gap-4">
        <ButtonIcon
          to={{ pathname: previousPath, search }}
          icon={ChevronLeftIcon}
          label={t('event-management.proposal-page.previous')}
          variant="secondary"
          size="sm"
          disabled={!previousPath}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <ButtonIcon
          to={{ pathname: nextPath, search }}
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
