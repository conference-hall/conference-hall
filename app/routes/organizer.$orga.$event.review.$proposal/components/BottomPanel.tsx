import c from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { ButtonLink } from '~/design-system/Buttons';
import { RatingButtons, findRatingOption } from './RatingButtons';
import { useParams, useSearchParams } from '@remix-run/react';
import { Text } from '~/design-system/Typography';

type Props = {
  nextId?: string;
  previousId?: string;
  deliberationEnabled: boolean;
  userRating: { rating?: number | null; feeling?: string | null };
  className?: string;
};

export function BottomPanel({ nextId, previousId, deliberationEnabled, userRating, className }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <section
      aria-label="Review proposal actions section"
      className={c('flex items-center justify-between border-t border-gray-200 bg-gray-50 px-8 py-8', className)}
    >
      <div className="w-24">
        <ButtonLink
          to={{
            pathname: `/organizer/${params.orga}/${params.event}/review/${previousId}`,
            search: searchParams.toString(),
          }}
          variant="secondary"
          iconLeft={ChevronLeftIcon}
          disabled={!previousId}
        >
          Previous
        </ButtonLink>
      </div>
      {deliberationEnabled ? (
        <RatingButtons userRating={userRating} />
      ) : (
        <Text size="l" strong>
          {findRatingOption(userRating)?.label}
        </Text>
      )}
      <div className="w-24">
        <ButtonLink
          to={{
            pathname: `/organizer/${params.orga}/${params.event}/review/${nextId}`,
            search: searchParams.toString(),
          }}
          variant="secondary"
          iconRight={ChevronRightIcon}
          disabled={!nextId}
        >
          Next
        </ButtonLink>
      </div>
    </section>
  );
}
