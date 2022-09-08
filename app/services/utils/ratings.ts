import type { Rating } from '@prisma/client';

export class RatingsDetails {
  ratings: Array<Rating>;

  constructor(ratings: Array<Rating>) {
    this.ratings = ratings;
  }

  get negatives() {
    return this.ratings.filter((r) => r.feeling === 'NEGATIVE').length;
  }

  get positives() {
    return this.ratings.filter((r) => r.feeling === 'POSITIVE').length;
  }

  get average() {
    const rates = this.ratings
      .filter((r) => r.feeling !== 'NO_OPINION' && r.rating !== null)
      .map((r) => r.rating || 0)
      .filter((r) => r !== null);

    if (rates.length === 0) return null;

    return rates.reduce((acc, next) => acc + next, 0) / rates.length;
  }

  fromUser(uid: string) {
    return this.ratings.find((r) => r.userId === uid);
  }
}
