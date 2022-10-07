import c from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { ButtonLink } from '~/design-system/Buttons';
import { RatingButtons } from './RatingButtons';
import { useParams, useSearchParams } from '@remix-run/react';

type Props = {
  nextId?: string;
  previousId?: string;
  userRating: { rating?: number | null; feeling?: string | null };
  className?: string;
};

export function ProposalFooter({ nextId, previousId, userRating, className }: Props) {
  const { slug, eventSlug } = useParams();
  const [searchParams] = useSearchParams();

  return (
    <section
      className={c('flex items-center justify-between border-t border-gray-200 bg-gray-50 py-8 px-8', className)}
    >
      <div className="w-24">
        <ButtonLink
          to={{ pathname: `/organizer/${slug}/${eventSlug}/proposals/${previousId}`, search: searchParams.toString() }}
          variant="secondary"
          iconLeft={ChevronLeftIcon}
          disabled={!previousId}
        >
          Previous
        </ButtonLink>
      </div>
      <RatingButtons userRating={userRating} />
      <div className="w-24">
        <ButtonLink
          to={{ pathname: `/organizer/${slug}/${eventSlug}/proposals/${nextId}`, search: searchParams.toString() }}
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
