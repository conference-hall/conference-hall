import type { Rating, User } from '@prisma/client';
import { sortBy } from '~/utils/arrays';

type RatingData = Rating & { user?: Partial<User> };

export class RatingsDetails {
  ratings: Array<RatingData>;

  constructor(ratings: Array<RatingData>) {
    this.ratings = ratings;
  }

  summary() {
    return {
      average: this.average(),
      positives: this.positives(),
      negatives: this.negatives(),
    };
  }

  ofUser(userId: string) {
    const user = this.ratings.find((r) => r.userId === userId);
    if (!user) return { rating: null, feeling: null, comment: null };
    return { rating: user.rating, feeling: user.feeling, comment: user.comment };
  }

  ofMembers() {
    return sortBy(
      this.ratings.map((rating) => ({
        id: rating.user?.id,
        name: rating.user?.name,
        picture: rating.user?.picture,
        rating: rating.rating,
        feeling: rating.feeling,
        comment: rating.comment,
      })),
      'name'
    );
  }

  private negatives() {
    return this.ratings.filter((r) => r.feeling === 'NEGATIVE').length;
  }

  private positives() {
    return this.ratings.filter((r) => r.feeling === 'POSITIVE').length;
  }

  private average() {
    const rates = this.ratings
      .filter((r) => r.feeling !== 'NO_OPINION' && r.rating !== null)
      .map((r) => r.rating || 0)
      .filter((r) => r !== null);

    if (rates.length === 0) return null;

    return rates.reduce((acc, next) => acc + next, 0) / rates.length;
  }
}
