import { H2, Text } from '~/design-system/Typography';
import { GlobalReviewNote } from '~/routes/__components/reviews/ReviewNote';
import type { GlobalReview, UserReview } from '~/types/proposals.types';

type Props = { review: GlobalReview | null; userReview: UserReview };

export function ReviewDetails({ review, userReview }: Props) {
  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">Review information</H2>

      {review && (
        <div className="flex items-center justify-between">
          <Text weight="medium">Global review</Text>
          <div className="flex gap-4">
            <GlobalReviewNote feeling="NEUTRAL" note={review?.average} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Text weight="medium">Your review</Text>
        <GlobalReviewNote feeling={userReview.feeling} note={userReview.note} />
      </div>
    </div>
  );
}
