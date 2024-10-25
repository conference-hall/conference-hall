import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, ReviewDisabledError } from '~/libs/errors.server.ts';

import { ProposalReview } from './proposal-review.ts';

describe('ProposalReview', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [speaker] });
    event = await eventFactory({ team, traits: ['withSurvey'] });
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
      await surveyFactory({ event, user: speaker, attributes: { answers: { gender: 'male' } } });

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
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            bio: speaker.bio,
            location: speaker.location,
            email: speaker.email,
            picture: speaker.picture,
            company: speaker.company,
            references: speaker.references,
            socials: speaker.socials,
            survey: { gender: 'male' },
          },
        ],
        reviews: {
          summary: { average: null, negatives: 0, positives: 0 },
          you: { feeling: null, note: null },
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
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0 } });
      await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();

      expect(review.reviews).toEqual({
        summary: { average: 2.5, positives: 1, negatives: 1 },
        you: { note: 0, feeling: 'NEGATIVE' },
      });
    });

    it('does not returns reviews summary when display proposals reviews setting is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0 } });

      const review = await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).get();

      expect(review.reviews).toEqual({
        summary: null,
        you: { note: 0, feeling: 'NEGATIVE' },
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

  describe('#getOtherProposals', () => {
    it('returns other speakers proposals', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), traits: ['draft'] });
      const event2 = await eventFactory({ team });
      await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker] }) });
      const review = await reviewFactory({
        proposal: proposal2,
        user: owner,
        attributes: { feeling: 'NEUTRAL', note: 3 },
      });

      const proposalReview = ProposalReview.for(owner.id, team.slug, event.slug, proposal1.id);
      const otherProposals = await proposalReview.getOtherProposals([speaker.id]);

      expect(otherProposals).toEqual([
        { id: proposal2.id, title: proposal2.title, review: review.note, speakers: [speaker.name] },
      ]);
    });

    it('returns other speakers proposals without reviews when disabled for event', async () => {
      const event2 = await eventFactory({ team, attributes: { displayProposalsReviews: false } });
      const proposal1 = await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({
        proposal: proposal2,
        user: owner,
        attributes: { feeling: 'NEUTRAL', note: 3 },
      });

      const proposalReview = ProposalReview.for(owner.id, team.slug, event2.slug, proposal1.id);
      const otherProposals = await proposalReview.getOtherProposals([speaker.id]);

      expect(otherProposals).toEqual([
        { id: proposal2.id, title: proposal2.title, review: null, speakers: [speaker.name] },
      ]);
    });

    it('returns empty array when speakers display disabled', async () => {
      const event2 = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
      const proposal1 = await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker] }) });

      const proposalReview = ProposalReview.for(owner.id, team.slug, event2.slug, proposal1.id);
      const otherProposals = await proposalReview.getOtherProposals([speaker.id]);

      expect(otherProposals).toEqual([]);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
      await expect(
        ProposalReview.for(user.id, team.slug, event.slug, proposal.id).getOtherProposals([]),
      ).rejects.toThrowError(ForbiddenOperationError);
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

      expect(pagination).toEqual({ current: 1, total: 1, reviewed: 0, previousId: undefined, nextId: undefined });
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
        reviewed: 0,
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
        reviewed: 0,
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
      });

      const reviews1 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
      expect(reviews1.length).toBe(1);

      const review = reviews1[0];
      expect(review.feeling).toBe('NEUTRAL');
      expect(review.note).toBe(2);
      expect(review.proposal.avgRateForSort).toBe(2);

      // Update first review
      await ProposalReview.for(owner.id, team.slug, event.slug, proposal.id).addReview({
        feeling: 'POSITIVE',
        note: 5,
      });

      const reviews2 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
      expect(reviews2.length).toBe(1);

      const updatedReview = reviews2[0];
      expect(updatedReview.feeling).toBe('POSITIVE');
      expect(updatedReview.note).toBe(5);
      expect(updatedReview.proposal.avgRateForSort).toBe(5);

      // Second review
      await ProposalReview.for(member.id, team.slug, event.slug, proposal.id).addReview({
        feeling: 'NEUTRAL',
        note: 0,
      });

      const reviews3 = await db.review.findMany({ where: { proposalId: proposal.id }, include: { proposal: true } });
      expect(reviews3.length).toBe(2);
      expect(reviews3[0].proposal.avgRateForSort).toBe(2.5);
    });

    it('throws an error if event deliberation is disabled', async () => {
      await db.event.update({ data: { reviewEnabled: false }, where: { id: event.id } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(owner.id, team.slug, event.slug, proposal.id);
      await expect(review.addReview({ feeling: 'NEUTRAL', note: 2 })).rejects.toThrowError(ReviewDisabledError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const review = ProposalReview.for(user.id, team.slug, event.slug, proposal.id);
      await expect(review.addReview({ feeling: 'NEUTRAL', note: 2 })).rejects.toThrowError(ForbiddenOperationError);
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
});
