import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { reviewFactory } from 'tests/factories/reviews';
import { surveyFactory } from 'tests/factories/surveys';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';
import { ForbiddenOperationError, ReviewDisabledError } from '~/libs/errors';

import { ProposalReview } from './ProposalReview';

describe('ProposalReview', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner, member] });
    event = await eventFactory({ team });
  });

  describe('#addReview', () => {
    it('adds then updates a review for a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      // First review
      await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).addReview({
        feeling: 'NEUTRAL',
        note: 2,
        comment: 'Why not',
      });

      const reviews1 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
      expect(reviews1.length).toBe(1);

      const review = reviews1[0];
      expect(review.feeling).toBe('NEUTRAL');
      expect(review.note).toBe(2);
      expect(review.comment).toBe('Why not');
      expect(review.proposal.avgRateForSort).toBe(2);

      // Update first review
      await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).addReview({
        feeling: 'POSITIVE',
        note: 5,
        comment: 'Too good!',
      });

      const reviews2 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
      expect(reviews2.length).toBe(1);

      const updatedReview = reviews2[0];
      expect(updatedReview.feeling).toBe('POSITIVE');
      expect(updatedReview.note).toBe(5);
      expect(updatedReview.comment).toBe('Too good!');
      expect(updatedReview.proposal.avgRateForSort).toBe(5);

      // Second review
      await ProposalReview.for(member.id, team.slug, event.slug, proposal.id).addReview({
        feeling: 'NEUTRAL',
        note: 0,
        comment: 'Too bad!',
      });

      const reviews3 = await db.review.findMany({ where: { proposalId: proposal.id }, include: { proposal: true } });
      expect(reviews3.length).toBe(2);
      expect(reviews3[0].proposal.avgRateForSort).toBe(2.5);
    });

    it('throws an error if event deliberation is disabled', async () => {
      await db.event.update({ data: { reviewEnabled: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal.id);
      await expect(review.addReview({ feeling: 'NEUTRAL', note: 2, comment: null })).rejects.toThrowError(
        ReviewDisabledError,
      );
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(user.id, team.slug, event.slug, proposal.id);
      await expect(review.addReview({ feeling: 'NEUTRAL', note: 2, comment: null })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#getSpeakerInfo', () => {
    it('returns speakers data of a proposal', async () => {
      const survey = await surveyFactory({
        event,
        user: member,
        attributes: { answers: { gender: 'male', tshirt: 'XL' } },
      });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker, member] }) });

      const speakers = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).getSpeakerInfo();

      expect(speakers).toEqual([
        {
          id: member.id,
          name: member.name,
          email: member.email,
          bio: member.bio,
          address: member.address,
          company: member.company,
          picture: member.picture,
          references: member.references,
          socials: member.socials,
          survey: survey.answers,
        },
        {
          id: speaker.id,
          name: speaker.name,
          email: speaker.email,
          bio: speaker.bio,
          address: speaker.address,
          company: speaker.company,
          picture: speaker.picture,
          references: speaker.references,
          socials: speaker.socials,
          survey: undefined,
        },
      ]);
    });

    it('throws an error if display speakers setting is false', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker, member] }) });
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id);
      await expect(review.getSpeakerInfo()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker, member] }) });
      const review = await ProposalReview.for(user.id, team.slug, event.slug, proposal.id);
      await expect(review.getSpeakerInfo()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getTeamReviews', () => {
    it('returns proposal reviews', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0 } });
      await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5, comment: 'Yeah!' } });

      const reviews = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).getTeamReviews();

      expect(reviews).toEqual([
        { feeling: 'POSITIVE', id: member.id, name: member.name, picture: member.picture, note: 5, comment: 'Yeah!' },
        { feeling: 'NEGATIVE', id: owner.id, name: owner.name, picture: owner.picture, note: 0, comment: null },
      ]);
    });

    it('throws an error if display of reviews is disabled for the event', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal.id);
      await expect(review.getTeamReviews()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

      const review = ProposalReview.for(user.id, team.slug, event.slug, proposal.id);
      await expect(review.getTeamReviews()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
