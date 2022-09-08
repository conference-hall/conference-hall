import { RatingFeeling } from '@prisma/client';
import { RatingsDetails } from './ratings.server';

describe('#RatingsInfo', () => {
  it('computes ratings info from user ratings', () => {
    const common = { id: '1', proposalId: 'p1', createdAt: new Date(), updatedAt: new Date() };

    const rating1 = { userId: 'uid1', feeling: RatingFeeling.POSITIVE, rating: 5, ...common };
    const rating2 = { userId: 'uid2', feeling: RatingFeeling.NO_OPINION, rating: null, ...common };
    const rating3 = { userId: 'uid3', feeling: RatingFeeling.NEGATIVE, rating: 0, ...common };

    const ratings = new RatingsDetails([rating1, rating2, rating3]);

    expect(ratings.negatives).toBe(1);
    expect(ratings.positives).toBe(1);
    expect(ratings.average).toBe(2.5);
    expect(ratings.fromUser('uid1')).toBe(rating1);
  });

  it('computes default values if no ratings', () => {
    const ratings = new RatingsDetails([]);

    expect(ratings.negatives).toBe(0);
    expect(ratings.positives).toBe(0);
    expect(ratings.average).toBeNull();
    expect(ratings.fromUser('uid1')).toBeUndefined();
  });
});
