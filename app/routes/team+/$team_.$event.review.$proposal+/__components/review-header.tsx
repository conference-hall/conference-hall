import { XMarkIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams, useSearchParams } from '@remix-run/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { IconLink } from '~/design-system/IconButtons.tsx';
import { Text } from '~/design-system/Typography.tsx';

import { ReviewsProgress } from '../../$team.$event+/__components/list/reviews-progress';

type Props = { current: number; total: number; reviewed: number; nextId?: string; previousId?: string };

export function ReviewHeader({ current, total, reviewed, nextId, previousId }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const search = searchParams.toString();

  const previousPath =
    previousId !== undefined ? `/team/${params.team}/${params.event}/review/${previousId}` : undefined;
  const nextPath = nextId !== undefined ? `/team/${params.team}/${params.event}/review/${nextId}` : undefined;
  const closePath = `/team/${params.team}/${params.event}`;

  useHotkeys('left', () => navigate({ pathname: previousPath, search }), { enabled: !!previousPath });
  useHotkeys('right', () => navigate({ pathname: nextPath, search }), { enabled: !!nextPath });
  useHotkeys('escape', () => navigate({ pathname: closePath, search }));

  return (
    <div className="sticky top-0 bg-white border-b border-b-gray-200 shadow-sm z-10">
      <header className="max-w-7xl m-auto flex justify-between items-center gap-4 p-4">
        <nav className="flex items-center gap-2 lg:gap-4">
          <IconLink
            to={{ pathname: previousPath, search }}
            icon={ChevronLeftIcon}
            label="Previous proposal"
            variant="secondary"
            aria-disabled={!previousPath}
          />
          <Text weight="medium">{`${current}/${total}`}</Text>
          <IconLink
            to={{ pathname: nextPath, search }}
            icon={ChevronRightIcon}
            label="Next proposal"
            variant="secondary"
            aria-disabled={!nextPath}
          />
        </nav>

        <div className="flex items-center gap-8">
          <ReviewsProgress reviewed={reviewed} total={total} />
          <IconLink to={{ pathname: closePath, search }} icon={XMarkIcon} label="Close review" variant="secondary" />
        </div>
      </header>
    </div>
  );
}
