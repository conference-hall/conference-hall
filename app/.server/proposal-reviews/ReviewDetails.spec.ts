import { ReviewFeeling } from '@prisma/client';

import { ReviewDetails } from './ReviewDetails.ts';

describe('#ReviewsDetails', () => {
  it('computes reviews info from user reviews', () => {
    const common = { id: '1', proposalId: 'p1', createdAt: new Date(), updatedAt: new Date() };
    const user1 = { id: 'uid1', name: 'John doe', picture: 'j.png' };
    const review1 = { userId: 'uid1', feeling: ReviewFeeling.POSITIVE, note: 5, user: user1, ...common };
    const user2 = { id: 'uid2', name: 'Jane doe', picture: 'd.png' };
    const review2 = { userId: 'uid2', feeling: ReviewFeeling.NO_OPINION, note: null, user: user2, ...common };
    const user3 = { id: 'uid3', name: 'Bob doe', picture: 'b.png' };
    const review3 = { userId: 'uid3', feeling: ReviewFeeling.NEGATIVE, note: 0, user: user3, ...common };

    const reviews = new ReviewDetails([review1, review2, review3]);

    expect(reviews.summary()).toEqual({ average: 2.5, positives: 1, negatives: 1 });
    expect(reviews.ofUser('uid1')).toEqual({ note: review1.note, feeling: review1.feeling });
    expect(reviews.ofMembers()).toEqual([
      { id: 'uid3', name: 'Bob doe', picture: 'b.png', note: 0, feeling: 'NEGATIVE' },
      { id: 'uid2', name: 'Jane doe', picture: 'd.png', note: null, feeling: 'NO_OPINION' },
      { id: 'uid1', name: 'John doe', picture: 'j.png', note: 5, feeling: 'POSITIVE' },
    ]);
  });

  it('computes default values if no reviews', () => {
    const reviews = new ReviewDetails([]);

    expect(reviews.summary()).toEqual({ average: null, positives: 0, negatives: 0 });
    expect(reviews.ofUser('uid1')).toEqual({ note: null, feeling: null });
    expect(reviews.ofMembers()).toEqual([]);
  });
});
