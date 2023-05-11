import { RatingFeeling } from '@prisma/client';
import { RatingsDetails } from './ratings-details';

describe('#RatingsDetails', () => {
  it('computes ratings info from user ratings', () => {
    const common = { id: '1', proposalId: 'p1', createdAt: new Date(), updatedAt: new Date(), comment: null };
    const user1 = { id: 'uid1', name: 'John doe', picture: 'j.png' };
    const rating1 = { userId: 'uid1', feeling: RatingFeeling.POSITIVE, rating: 5, user: user1, ...common };
    const user2 = { id: 'uid2', name: 'Jane doe', picture: 'd.png' };
    const rating2 = { userId: 'uid2', feeling: RatingFeeling.NO_OPINION, rating: null, user: user2, ...common };
    const user3 = { id: 'uid3', name: 'Bob doe', picture: 'b.png' };
    const rating3 = { userId: 'uid3', feeling: RatingFeeling.NEGATIVE, rating: 0, user: user3, ...common };

    const ratings = new RatingsDetails([rating1, rating2, rating3]);

    expect(ratings.summary()).toEqual({ average: 2.5, positives: 1, negatives: 1 });
    expect(ratings.ofUser('uid1')).toEqual({ rating: rating1.rating, feeling: rating1.feeling, comment: null });
    expect(ratings.ofMembers()).toEqual([
      { id: 'uid3', name: 'Bob doe', picture: 'b.png', rating: 0, feeling: 'NEGATIVE', comment: null },
      { id: 'uid2', name: 'Jane doe', picture: 'd.png', rating: null, feeling: 'NO_OPINION', comment: null },
      { id: 'uid1', name: 'John doe', picture: 'j.png', rating: 5, feeling: 'POSITIVE', comment: null },
    ]);
  });

  it('computes default values if no ratings', () => {
    const ratings = new RatingsDetails([]);

    expect(ratings.summary()).toEqual({ average: null, positives: 0, negatives: 0 });
    expect(ratings.ofUser('uid1')).toEqual({ rating: null, feeling: null, comment: null });
    expect(ratings.ofMembers()).toEqual([]);
  });
});
