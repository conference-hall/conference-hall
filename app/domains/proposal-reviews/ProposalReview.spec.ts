import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
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
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [speaker] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
  });

  describe('#get', () => {
    it('returns proposal review data', async () => {
      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        talk: await talkFactory({ speakers: [speaker] }),
      });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();

      expect(review).toEqual({
        id: proposal.id,
        title: proposal.title,
        abstract: proposal.abstract,
        references: proposal.references,
        level: proposal.level,
        deliberationStatus: proposal.deliberationStatus,
        publicationStatus: proposal.publicationStatus,
        confirmationStatus: proposal.confirmationStatus,
        languages: ['en'],
        formats: [{ id: format.id, name: format.name }],
        categories: [{ id: category.id, name: category.name }],
        speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture, company: speaker.company }],
        reviews: {
          summary: { average: null, negatives: 0, positives: 0 },
          you: { feeling: null, note: null, comment: null },
        },
      });
    });

    it('does not returns speakers when display proposals speaker setting is false', async () => {
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();
      expect(review.speakers).toEqual([]);
    });

    it('returns teams reviews', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0, comment: 'Booo' } });
      await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();

      expect(review.reviews).toEqual({
        summary: { average: 2.5, positives: 1, negatives: 1 },
        you: { note: 0, feeling: 'NEGATIVE', comment: 'Booo' },
      });
    });

    it('does not returns reviews summary when display proposals reviews setting is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0, comment: 'Booo' } });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();

      expect(review.reviews).toEqual({
        summary: null,
        you: { note: 0, feeling: 'NEGATIVE', comment: 'Booo' },
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
      await expect(ProposalReview.for(user.id, team.slug, event.slug, proposal.id).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#getPreviousAndNextReviews', () => {
    it('returns a default pagination when no other reviews', async () => {
      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        talk: await talkFactory({ speakers: [speaker] }),
      });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal.id);
      const pagination = await review.getPreviousAndNextReviews({});

      expect(pagination).toEqual({ current: 1, total: 1, previousId: undefined, nextId: undefined });
    });

    it('returns pagination for next and previous proposals', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal3 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal2.id);
      const pagination = await review.getPreviousAndNextReviews({});

      expect(pagination).toEqual({
        current: 2,
        total: 3,
        nextId: proposal1.id,
        previousId: proposal3.id,
      });
    });

    it('returns pagination for next and previous proposals with filters', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
      });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
      const proposal3 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
      });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
      const proposal5 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
      });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal3.id);
      const pagination = await review.getPreviousAndNextReviews({ query: 'foo' });

      expect(pagination).toEqual({
        current: 2,
        total: 3,
        nextId: proposal1.id,
        previousId: proposal5.id,
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
      await expect(
        ProposalReview.for(user.id, team.slug, event.slug, proposal.id).getPreviousAndNextReviews({}),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
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

  describe('#update', () => {
    it('updates the proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const updated = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).update({
        title: 'Updated',
        abstract: 'Updated',
        level: 'ADVANCED',
        references: 'Updated',
        languages: [],
        formats: [format.id],
        categories: [category.id],
      });

      expect(updated.title).toBe('Updated');
      expect(updated.abstract).toBe('Updated');
      expect(updated.level).toBe('ADVANCED');
      expect(updated.references).toBe('Updated');

      const formatCount = await db.eventFormat.count({ where: { proposals: { some: { id: proposal.id } } } });
      expect(formatCount).toBe(1);

      const categoryCount = await db.eventCategory.count({ where: { proposals: { some: { id: proposal.id } } } });
      expect(categoryCount).toBe(1);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(
        ProposalReview.for(speaker.id, team.slug, event.slug, proposal.id).update({
          title: 'Updated',
          abstract: 'Updated',
          level: null,
          references: null,
          languages: [],
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(
        ProposalReview.for(user.id, team.slug, event.slug, proposal.id).update({
          title: 'Updated',
          abstract: 'Updated',
          level: null,
          references: null,
          languages: [],
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
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
});
