import type { Event, EventSpeaker, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { EventSpeakers } from './event-speakers.ts';

describe('EventSpeakers', () => {
  let owner: User;
  let member: User;
  let speaker1: User;
  let speaker2: User;
  let speaker3: User;
  let team: Team;
  let event: Event;
  let eventSpeaker1: EventSpeaker;
  let eventSpeaker2: EventSpeaker;
  let eventSpeaker3: EventSpeaker;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));

    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker1 = await userFactory({ traits: ['peter-parker'] });
    speaker2 = await userFactory({
      attributes: {
        name: 'Alice Johnson',
        company: 'Tech Corp',
      },
    });
    speaker3 = await userFactory({
      attributes: {
        name: 'Bob Wilson',
        company: 'Dev Inc',
      },
    });

    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });

    eventSpeaker1 = await eventSpeakerFactory({ event, user: speaker1 });
    eventSpeaker2 = await eventSpeakerFactory({ event, user: speaker2 });
    eventSpeaker3 = await eventSpeakerFactory({ event, user: speaker3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#search', () => {
    describe('when user has access to event', () => {
      it('returns all speakers for the event by default', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({});

        expect(result.speakers).toHaveLength(3);
        expect(result.speakers[0]).toEqual({
          id: eventSpeaker2.id,
          name: 'Alice Johnson',
          picture: eventSpeaker2.picture,
          company: 'Tech Corp',
          proposals: [],
        });
        expect(result.speakers[1]).toEqual({
          id: eventSpeaker3.id,
          name: 'Bob Wilson',
          picture: eventSpeaker3.picture,
          company: 'Dev Inc',
          proposals: [],
        });
        expect(result.speakers[2]).toEqual({
          id: eventSpeaker1.id,
          name: 'Peter Parker',
          picture: eventSpeaker1.picture,
          company: speaker1.company,
          proposals: [],
        });
      });

      it('returns pagination metadata', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({});

        expect(result.pagination).toEqual({
          current: 1,
          total: 1,
        });
        expect(result.statistics).toEqual({
          total: 3,
        });
      });

      it('filters speakers by query (case insensitive)', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
          query: 'alice',
        });

        expect(result.speakers).toHaveLength(1);
        expect(result.speakers[0].name).toBe('Alice Johnson');
      });

      it('filters speakers by partial name match', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
          query: 'bob',
        });

        expect(result.speakers).toHaveLength(1);
        expect(result.speakers[0].name).toBe('Bob Wilson');
      });

      it('returns empty results for non-matching query', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
          query: 'nonexistent',
        });

        expect(result.speakers).toHaveLength(0);
      });

      describe('sorting', () => {
        it('sorts speakers by name ascending by default', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({});

          expect(result.speakers.map((s) => s.name)).toEqual(['Alice Johnson', 'Bob Wilson', 'Peter Parker']);
        });

        it('sorts speakers by name ascending when explicitly specified', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            sort: 'name-asc',
          });

          expect(result.speakers.map((s) => s.name)).toEqual(['Alice Johnson', 'Bob Wilson', 'Peter Parker']);
        });

        it('sorts speakers by name descending', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            sort: 'name-desc',
          });

          expect(result.speakers.map((s) => s.name)).toEqual(['Peter Parker', 'Bob Wilson', 'Alice Johnson']);
        });
      });

      describe('proposal status filtering', () => {
        beforeEach(async () => {
          // Create proposals with different statuses
          const talk1 = await talkFactory({ speakers: [speaker1] });
          const talk2 = await talkFactory({ speakers: [speaker2] });
          const talk3 = await talkFactory({ speakers: [speaker3] });

          await proposalFactory({
            event,
            talk: talk1,
            attributes: {
              deliberationStatus: 'ACCEPTED',
              confirmationStatus: 'CONFIRMED',
            },
          });

          await proposalFactory({
            event,
            talk: talk2,
            attributes: {
              deliberationStatus: 'ACCEPTED',
              confirmationStatus: 'DECLINED',
            },
          });

          await proposalFactory({
            event,
            talk: talk3,
            attributes: {
              deliberationStatus: 'PENDING',
            },
          });
        });

        it('filters speakers with accepted proposals', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(2);
          expect(result.speakers.map((s) => s.name).sort()).toEqual(['Alice Johnson', 'Peter Parker']);
        });

        it('filters speakers with confirmed proposals', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            proposalStatus: 'confirmed',
          });

          expect(result.speakers).toHaveLength(1);
          expect(result.speakers[0].name).toBe('Peter Parker');
        });

        it('filters speakers with declined proposals', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            proposalStatus: 'declined',
          });

          expect(result.speakers).toHaveLength(1);
          expect(result.speakers[0].name).toBe('Alice Johnson');
        });

        it('excludes draft proposals from results', async () => {
          const talk4 = await talkFactory({ speakers: [speaker3] });
          await proposalFactory({
            event,
            talk: talk4,
            attributes: {
              deliberationStatus: 'ACCEPTED',
              isDraft: true,
            },
          });

          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(2);
          expect(result.speakers.map((s) => s.name).sort()).toEqual(['Alice Johnson', 'Peter Parker']);
        });
      });

      describe('pagination', () => {
        beforeEach(async () => {
          // Create more speakers to test pagination
          for (let i = 4; i <= 25; i++) {
            await eventSpeakerFactory({
              event,
              attributes: { name: `Speaker ${i.toString().padStart(2, '0')}` },
            });
          }
        });

        it('returns first page by default', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({});

          expect(result.speakers).toHaveLength(20); // Default page size
          expect(result.pagination).toEqual({
            current: 1,
            total: 2, // 25 total speakers, 20 per page = 2 pages
          });
        });

        it('returns specified page', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({}, 2);

          expect(result.speakers).toHaveLength(5); // Remaining speakers on page 2
          expect(result.pagination).toEqual({
            current: 2,
            total: 2,
          });
        });
      });

      describe('combined filters', () => {
        beforeEach(async () => {
          const talk1 = await talkFactory({ speakers: [speaker1] });
          await proposalFactory({
            event,
            talk: talk1,
            attributes: { deliberationStatus: 'ACCEPTED' },
          });
        });

        it('combines query and proposal status filters', async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            query: 'peter',
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(1);
          expect(result.speakers[0].name).toBe('Peter Parker');
        });

        it("returns empty results when filters don't match", async () => {
          const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({
            query: 'bob',
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(0);
        });
      });

      it('includes proposals data for each speaker', async () => {
        const talk = await talkFactory({ speakers: [speaker1] });
        const proposal = await proposalFactory({
          event,
          talk,
          attributes: {
            title: 'Great Talk',
            deliberationStatus: 'ACCEPTED',
            confirmationStatus: 'CONFIRMED',
          },
        });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).search({});

        const speakerWithProposal = result.speakers.find((s) => s.id === eventSpeaker1.id);
        expect(speakerWithProposal?.proposals).toEqual([
          {
            id: proposal.id,
            title: 'Great Talk',
            deliberationStatus: 'ACCEPTED',
            confirmationStatus: 'CONFIRMED',
          },
        ]);
      });
    });

    describe('when user does not have access to event', () => {
      it('throws ForbiddenOperationError for non-member', async () => {
        const outsider = await userFactory();

        await expect(EventSpeakers.for(outsider.id, team.slug, event.slug).search({})).rejects.toThrow(
          ForbiddenOperationError,
        );
      });
    });

    describe('when event does not exist', () => {
      it('throws error for non-existent event', async () => {
        await expect(EventSpeakers.for(owner.id, team.slug, 'non-existent').search({})).rejects.toThrow();
      });
    });

    describe('when team does not exist', () => {
      it('throws error for non-existent team', async () => {
        await expect(EventSpeakers.for(owner.id, 'non-existent', event.slug).search({})).rejects.toThrow();
      });
    });
  });

  describe('#getById', () => {
    describe('when user has access to event', () => {
      it('returns complete speaker details with basic information', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result).toMatchObject({
          id: eventSpeaker1.id,
          name: 'Peter Parker',
          email: speaker1.email,
          bio: speaker1.bio,
          picture: eventSpeaker1.picture,
          company: speaker1.company,
          location: speaker1.location,
          references: speaker1.references,
          socialLinks: speaker1.socialLinks,
          userId: speaker1.id,
          proposals: [],
        });

        // Survey field depends on whether the speaker has survey answers
        // It can be undefined if no survey answers exist for this userId
        if (result?.survey !== undefined) {
          expect(Array.isArray(result.survey)).toBe(true);
        }
      });

      it('returns speaker without proposals when none exist', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker2.id);

        expect(result?.proposals).toEqual([]);
      });

      it('includes survey answers when speaker has userId and survey exists', async () => {
        await surveyFactory({
          user: speaker1,
          event,
          attributes: { answers: [{ question: 'experience', answer: 'expert' }] },
        });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.survey).toBeDefined();
        expect(Array.isArray(result?.survey)).toBe(true);
      });

      it('returns empty survey when speaker has no userId', async () => {
        const speakerWithoutUser = await eventSpeakerFactory({ event, attributes: { name: 'Guest Speaker' } });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(speakerWithoutUser.id);

        expect(result?.survey).toEqual([]);
        expect(result?.userId).toBeNull();
      });

      it('includes proposals with complete data structure', async () => {
        const talk = await talkFactory({ speakers: [speaker1] });
        const tag = await eventProposalTagFactory({ event });
        const proposal = await proposalFactory({
          event,
          talk,
          tags: [tag],
          attributes: {
            title: 'Amazing React Talk',
            deliberationStatus: 'ACCEPTED',
            publicationStatus: 'PUBLISHED',
            confirmationStatus: 'CONFIRMED',
          },
        });
        await reviewFactory({ proposal, user: owner, attributes: { feeling: 'POSITIVE', note: 4 } });
        await commentFactory({ proposal, user: member });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals).toHaveLength(1);
        expect(result?.proposals[0]).toMatchObject({
          id: proposal.id,
          title: 'Amazing React Talk',
          deliberationStatus: 'ACCEPTED',
          publicationStatus: 'PUBLISHED',
          confirmationStatus: 'CONFIRMED',
          createdAt: proposal.createdAt,
          speakers: [{ name: 'Peter Parker' }],
          comments: { count: 1 },
          tags: [{ id: tag.id, name: tag.name, color: tag.color }],
        });
        expect(result?.proposals[0].reviews.you).toMatchObject({ feeling: 'POSITIVE', note: 4 });
      });

      it('excludes draft proposals from results', async () => {
        const talk1 = await talkFactory({ speakers: [speaker1] });
        const talk2 = await talkFactory({ speakers: [speaker1] });

        // Create published proposal
        await proposalFactory({ event, talk: talk1, attributes: { title: 'Published Proposal', isDraft: false } });

        // Create draft proposal
        await proposalFactory({ event, talk: talk2, attributes: { title: 'Draft Proposal', isDraft: true } });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals).toHaveLength(1);
        expect(result?.proposals[0].title).toBe('Published Proposal');
      });

      it('includes review summary when event.displayProposalsReviews is enabled', async () => {
        // Enable proposal reviews display
        const talk = await talkFactory({ speakers: [speaker1] });
        const proposal = await proposalFactory({ event, talk });

        // Add multiple reviews to generate summary
        await reviewFactory({ proposal, user: owner, attributes: { feeling: 'POSITIVE', note: 4 } });
        await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals[0].reviews.summary).toBeDefined();
        expect(result?.proposals[0].reviews.summary?.average).toBeDefined();
      });

      it('excludes review summary when event.displayProposalsReviews is disabled', async () => {
        // Disable proposal reviews display
        await db.event.update({ where: { id: event.id }, data: { displayProposalsReviews: false } });
        const talk = await talkFactory({ speakers: [speaker1] });
        const proposal = await proposalFactory({ event, talk });

        await reviewFactory({
          proposal,
          user: owner,
          attributes: { feeling: 'POSITIVE', note: 4 },
        });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals[0].reviews.summary).toBeUndefined();
      });

      it('returns current user review in you field', async () => {
        const talk = await talkFactory({ speakers: [speaker1] });
        const proposal = await proposalFactory({ event, talk });
        await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 2 } });
        await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals[0].reviews.you).toMatchObject({ feeling: 'NEGATIVE', note: 2 });
      });

      it('returns null when speaker not found', async () => {
        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById('non-existent-id');

        expect(result).toBeNull();
      });

      it('returns null when speaker exists but not in the requested event', async () => {
        const otherEvent = await eventFactory({ team });
        const speakerInOtherEvent = await eventSpeakerFactory({ event: otherEvent });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(speakerInOtherEvent.id);

        expect(result).toBeNull();
      });

      it('handles speakers with multiple proposals', async () => {
        await proposalFactory({
          event,
          talk: await talkFactory({ speakers: [speaker1] }),
          attributes: { title: 'First Talk', deliberationStatus: 'ACCEPTED', confirmationStatus: 'CONFIRMED' },
        });

        await proposalFactory({
          event,
          talk: await talkFactory({ speakers: [speaker1] }),
          attributes: { title: 'Second Talk', deliberationStatus: 'PENDING', confirmationStatus: null },
        });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(eventSpeaker1.id);

        expect(result?.proposals).toHaveLength(2);

        const proposalTitles = result?.proposals.map((p) => p.title).sort();
        expect(proposalTitles).toEqual(['First Talk', 'Second Talk']);
      });

      it('handles speakers with social links', async () => {
        const speakerWithSocialLinks = await eventSpeakerFactory({
          event,
          attributes: {
            socialLinks: [
              { type: 'twitter', link: 'https://twitter.com/speaker' },
              { type: 'linkedin', link: 'https://linkedin.com/in/speaker' },
            ],
          },
        });

        const result = await EventSpeakers.for(owner.id, team.slug, event.slug).getById(speakerWithSocialLinks.id);

        expect(result?.socialLinks).toEqual([
          { type: 'twitter', link: 'https://twitter.com/speaker' },
          { type: 'linkedin', link: 'https://linkedin.com/in/speaker' },
        ]);
      });
    });

    describe('when user does not have access to event', () => {
      it('throws ForbiddenOperationError for non-member', async () => {
        const outsider = await userFactory();

        await expect(EventSpeakers.for(outsider.id, team.slug, event.slug).getById(eventSpeaker1.id)).rejects.toThrow(
          ForbiddenOperationError,
        );
      });
    });

    describe('when event does not exist', () => {
      it('throws error for non-existent event', async () => {
        await expect(
          EventSpeakers.for(owner.id, team.slug, 'non-existent').getById(eventSpeaker1.id),
        ).rejects.toThrow();
      });
    });

    describe('when team does not exist', () => {
      it('throws error for non-existent team', async () => {
        await expect(
          EventSpeakers.for(owner.id, 'non-existent', event.slug).getById(eventSpeaker1.id),
        ).rejects.toThrow();
      });
    });
  });
});
