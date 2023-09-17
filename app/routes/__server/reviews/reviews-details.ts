import type { Review, User } from '@prisma/client';

import { sortBy } from '~/utils/arrays.ts';

type ReviewData = Review & { user?: Partial<User> };

export class ReviewsDetails {
  reviews: Array<ReviewData>;

  constructor(reviews: Array<ReviewData>) {
    this.reviews = reviews;
  }

  summary() {
    return {
      average: this.average(),
      positives: this.positives(),
      negatives: this.negatives(),
    };
  }

  ofUser(userId: string) {
    const user = this.reviews.find((r) => r.userId === userId);
    if (!user) return { note: null, feeling: null, comment: null };
    return { note: user.note, feeling: user.feeling, comment: user.comment };
  }

  ofMembers() {
    return sortBy(
      this.reviews.map((review) => ({
        id: review.user?.id,
        name: review.user?.name,
        picture: review.user?.picture,
        note: review.note,
        feeling: review.feeling,
        comment: review.comment,
      })),
      'name',
    );
  }

  private negatives() {
    return this.reviews.filter((r) => r.feeling === 'NEGATIVE').length;
  }

  private positives() {
    return this.reviews.filter((r) => r.feeling === 'POSITIVE').length;
  }

  private average() {
    const rates = this.reviews
      .filter((r) => r.feeling !== 'NO_OPINION' && r.note !== null)
      .map((r) => r.note || 0)
      .filter((r) => r !== null);

    if (rates.length === 0) return null;

    return rates.reduce((acc, next) => acc + next, 0) / rates.length;
  }
}
