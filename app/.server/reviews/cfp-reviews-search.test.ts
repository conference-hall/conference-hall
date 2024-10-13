import type { Event, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.server.ts';

import { CfpReviewsSearch } from './cfp-reviews-search.ts';

describe('CfpReviewsSearch', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });

  describe('#search', () => {
    it('returns event proposals info', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({ status: 'pending' });

      expect(proposals.results).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          speakers: [{ name: speaker.name, picture: speaker.picture }],
          reviews: {
            summary: { negatives: 0, positives: 0, average: null },
            you: { note: null, feeling: null },
          },
        },
      ]);

      expect(proposals.filters).toEqual({ status: 'pending' });
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 1 });
      expect(proposals.pagination).toEqual({ current: 1, total: 1 });
    });

    it('does not return speakers when display proposal speakers is false', async () => {
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      let proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});
      expect(proposals.results[0]?.speakers).toEqual([]);

      proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({ query: 'parker' });
      expect(proposals.results.length).toEqual(0);
    });

    it('does not return reviews when display proposal reviews is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});
      expect(proposals.results[0].reviews.summary).toBeUndefined();
    });

    it('returns empty results of an event without proposals', async () => {
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});

      expect(proposals.results).toEqual([]);
      expect(proposals.filters).toEqual({});
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 0 });
      expect(proposals.pagination).toEqual({ current: 1, total: 0 });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

      const reviewsSearch = CfpReviewsSearch.for(user.id, team.slug, event.slug);

      await expect(reviewsSearch.search({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#autocomplete', () => {
    it('returns event proposals info', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).autocomplete({ status: 'pending' });

      expect(proposals).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          speakers: [{ name: speaker.name, picture: speaker.picture }],
        },
      ]);
    });

    it('returns empty results of an event without proposals', async () => {
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).autocomplete({});

      expect(proposals).toEqual([]);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

      const reviewsSearch = CfpReviewsSearch.for(user.id, team.slug, event.slug);

      await expect(reviewsSearch.autocomplete({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
