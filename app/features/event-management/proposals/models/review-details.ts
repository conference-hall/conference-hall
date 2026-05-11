import { randomUUID } from 'node:crypto';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import type { Review, User } from '../../../../../prisma/generated/client.ts';

type ReviewData = Review & { user?: Pick<User, 'id' | 'name' | 'picture'> };

export class ReviewDetails {
  private activeReviews: Array<ReviewData>;

  constructor(reviews: Array<ReviewData>) {
    this.activeReviews = reviews.filter((r) => r.dismissedAt === null);
  }

  summary() {
    return {
      average: this.average(),
      positives: this.positives(),
      negatives: this.negatives(),
    };
  }

  ofUser(userId: string) {
    const user = this.activeReviews.find((r) => r.userId === userId);
    if (!user) return { note: null, feeling: null };
    return { note: user.note, feeling: user.feeling };
  }

  ofMembers() {
    return sortBy(
      this.activeReviews.map((review) => ({
        id: review.user?.id ?? randomUUID(),
        name: review.user?.name ?? 'unknown',
        picture: review.user?.picture ?? null,
        note: review.note,
        feeling: review.feeling,
        updatedAt: review.updatedAt,
      })),
      'updatedAt',
    );
  }

  private negatives() {
    return this.activeReviews.filter((r) => r.feeling === 'NEGATIVE').length;
  }

  private positives() {
    return this.activeReviews.filter((r) => r.feeling === 'POSITIVE').length;
  }

  private average() {
    const rates = this.activeReviews
      .filter((r) => r.feeling !== 'NO_OPINION' && r.note !== null)
      .map((r) => r.note || 0)
      .filter((r) => r !== null);

    if (rates.length === 0) return null;

    return rates.reduce((acc, next) => acc + next, 0) / rates.length;
  }
}
