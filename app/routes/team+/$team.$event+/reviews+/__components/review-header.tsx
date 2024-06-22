import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from '@remix-run/react';

import { IconLink } from '~/design-system/IconButtons.tsx';
import { Text } from '~/design-system/Typography.tsx';

import { ReviewsProgress } from '../../__components/list/reviews-progress.tsx';

type Props = { current: number; total: number; reviewed: number; nextId?: string; previousId?: string };

export function ReviewHeader({ current, total, reviewed, nextId, previousId }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const search = searchParams.toString();

  const previousPath =
    previousId !== undefined ? `/team/${params.team}/${params.event}/reviews/${previousId}` : undefined;
  const nextPath = nextId !== undefined ? `/team/${params.team}/${params.event}/reviews/${nextId}` : undefined;

  return (
    <header className="max-w-7xl m-auto flex justify-between items-center gap-4 pb-4 px-4 lg:-mt-4">
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
      </div>
    </header>
  );
}
