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
import type { EventSpeakerSaveData } from '~/shared/types/speaker.types.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError, NotFoundError, SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import type { Event, EventSpeaker, Team, User } from '../../../../../prisma/generated/client.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { EventSpeakers } from './event-speakers.server.ts';

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
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({});

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
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({});

        expect(result.pagination).toEqual({
          current: 1,
          total: 1,
        });
        expect(result.statistics).toEqual({
          total: 3,
        });
      });

      it('filters speakers by query (case insensitive)', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({
          query: 'alice',
        });

        expect(result.speakers).toHaveLength(1);
        expect(result.speakers[0].name).toBe('Alice Johnson');
      });

      it('filters speakers by partial name match', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({
          query: 'bob',
        });

        expect(result.speakers).toHaveLength(1);
        expect(result.speakers[0].name).toBe('Bob Wilson');
      });

      it('filters speakers by exact email match (case insensitive)', async () => {
        const speakerWithEmail = await eventSpeakerFactory({
          event,
          attributes: { name: 'Jane Doe', email: 'jane.doe@example.com' },
        });
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({
          query: 'JANE.DOE@EXAMPLE.COM',
        });

        expect(result.speakers).toHaveLength(1);
        expect(result.speakers[0].id).toBe(speakerWithEmail.id);
        expect(result.speakers[0].name).toBe('Jane Doe');
      });

      it('returns empty results for non-matching query', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({
          query: 'nonexistent',
        });

        expect(result.speakers).toHaveLength(0);
      });

      describe('sorting', () => {
        it('sorts speakers by name ascending by default', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({});

          expect(result.speakers.map((s) => s.name)).toEqual(['Alice Johnson', 'Bob Wilson', 'Peter Parker']);
        });

        it('sorts speakers by name ascending when explicitly specified', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
            sort: 'name-asc',
          });

          expect(result.speakers.map((s) => s.name)).toEqual(['Alice Johnson', 'Bob Wilson', 'Peter Parker']);
        });

        it('sorts speakers by name descending', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
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
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(2);
          expect(result.speakers.map((s) => s.name).sort()).toEqual(['Alice Johnson', 'Peter Parker']);
        });

        it('filters speakers with confirmed proposals', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
            proposalStatus: 'confirmed',
          });

          expect(result.speakers).toHaveLength(1);
          expect(result.speakers[0].name).toBe('Peter Parker');
        });

        it('filters speakers with declined proposals', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
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
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
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
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({});

          expect(result.speakers).toHaveLength(20); // Default page size
          expect(result.pagination).toEqual({
            current: 1,
            total: 2, // 25 total speakers, 20 per page = 2 pages
          });
        });

        it('returns specified page', async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({}, 2);

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
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
            query: 'peter',
            proposalStatus: 'accepted',
          });

          expect(result.speakers).toHaveLength(1);
          expect(result.speakers[0].name).toBe('Peter Parker');
        });

        it("returns empty results when filters don't match", async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const result = await EventSpeakers.for(authorizedEvent).search({
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
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({});

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

      it('returns empty array when displayProposalsSpeakers is false even when speakers exist', async () => {
        const eventWithHiddenSpeakers = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
        await eventSpeakerFactory({ event: eventWithHiddenSpeakers, attributes: { name: 'John Doe' } });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithHiddenSpeakers.slug);

        const result = await EventSpeakers.for(authorizedEvent).search({});

        expect(result.speakers).toEqual([]);
        expect(result.pagination).toEqual({ current: 1, total: 0 });
        expect(result.statistics).toEqual({ total: 0 });
      });
    });
  });

  describe('#getById', () => {
    describe('when user has access to event', () => {
      it('returns complete speaker details with basic information', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

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
      });

      it('returns speaker without proposals when none exist', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker2.id);

        expect(result?.proposals).toEqual([]);
      });

      it('includes survey answers when speaker has userId and survey exists', async () => {
        await surveyFactory({
          user: speaker1,
          event,
          attributes: { answers: [{ question: 'experience', answer: 'expert' }] },
        });
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

        expect(result?.survey).toBeDefined();
        expect(Array.isArray(result?.survey)).toBe(true);
      });

      it('returns empty survey when speaker has no userId', async () => {
        const speakerWithoutUser = await eventSpeakerFactory({ event, attributes: { name: 'Guest Speaker' } });
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(speakerWithoutUser.id);

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

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

        expect(result?.proposals).toHaveLength(1);
        expect(result?.proposals[0]).toMatchObject({
          id: proposal.id,
          title: 'Amazing React Talk',
          deliberationStatus: 'ACCEPTED',
          publicationStatus: 'PUBLISHED',
          confirmationStatus: 'CONFIRMED',
          submittedAt: proposal.submittedAt,
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

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

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

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

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
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

        expect(result?.proposals[0].reviews.summary).toBeUndefined();
      });

      it('returns current user review in you field', async () => {
        const talk = await talkFactory({ speakers: [speaker1] });
        const proposal = await proposalFactory({ event, talk });
        await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 2 } });
        await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

        expect(result?.proposals[0].reviews.you).toMatchObject({ feeling: 'NEGATIVE', note: 2 });
      });

      it('returns null when speaker not found', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById('non-existent-id');

        expect(result).toBeNull();
      });

      it('returns null when speaker exists but not in the requested event', async () => {
        const otherEvent = await eventFactory({ team });
        const speakerInOtherEvent = await eventSpeakerFactory({ event: otherEvent });
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(speakerInOtherEvent.id);

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

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(eventSpeaker1.id);

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

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const result = await EventSpeakers.for(authorizedEvent).getById(speakerWithSocialLinks.id);

        expect(result?.socialLinks).toEqual([
          { type: 'twitter', link: 'https://twitter.com/speaker' },
          { type: 'linkedin', link: 'https://linkedin.com/in/speaker' },
        ]);
      });
    });
  });

  describe('#create', () => {
    describe('when user has create speaker permission', () => {
      it('creates an event speaker', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);

        const speakerData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: 'https://example.com/photo.jpg',
          bio: 'lorem ipsum',
          references: 'impedit quidem quisquam',
          company: 'company',
          location: 'location',
          socialLinks: ['https://github.com/profile'],
        };

        const createdSpeaker = await eventSpeakers.create(speakerData);

        expect(createdSpeaker).toEqual({
          id: expect.any(String),
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: 'https://example.com/photo.jpg',
          bio: 'lorem ipsum',
          references: 'impedit quidem quisquam',
          company: 'company',
          location: 'location',
          socialLinks: ['https://github.com/profile'],
        });

        const dbSpeaker = await db.eventSpeaker.findFirst({
          where: { id: createdSpeaker.id },
        });

        expect(dbSpeaker).toEqual(
          expect.objectContaining({
            eventId: event.id,
            userId: null,
            name: 'John Doe',
            email: 'john.doe@example.com',
            picture: 'https://example.com/photo.jpg',
            bio: 'lorem ipsum',
            references: 'impedit quidem quisquam',
            company: 'company',
            location: 'location',
            socialLinks: ['https://github.com/profile'],
          }),
        );
      });

      it('creates speaker with minimal required fields', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);

        const speakerData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const createdSpeaker = await eventSpeakers.create(speakerData);

        expect(createdSpeaker).toEqual({
          id: expect.any(String),
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        });
      });

      it('throws SpeakerEmailAlreadyExistsError when email already exists for the event', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);

        // Create first speaker
        const firstSpeakerData = {
          name: 'First Speaker',
          email: 'duplicate@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        await eventSpeakers.create(firstSpeakerData);

        // Try to create second speaker with same email
        await expect(
          eventSpeakers.create({
            name: 'Second Speaker',
            email: 'duplicate@example.com',
            picture: null,
            bio: null,
            references: null,
            company: null,
            location: null,
            socialLinks: [],
          }),
        ).rejects.toThrow(SpeakerEmailAlreadyExistsError);

        // Try to create second speaker with same email with different cases
        await expect(
          eventSpeakers.create({
            name: 'Second Speaker',
            email: 'DUPLICATE@example.com',
            picture: null,
            bio: null,
            references: null,
            company: null,
            location: null,
            socialLinks: [],
          }),
        ).rejects.toThrow(SpeakerEmailAlreadyExistsError);
      });

      it('allows same email in different events', async () => {
        // Create another event for the same team
        const otherEvent = await eventFactory({ team });

        const speakerData = {
          name: 'John Doe',
          email: 'same@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        // Create speaker in first event
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const firstEventSpeakers = EventSpeakers.for(authorizedEvent);
        const firstSpeaker = await firstEventSpeakers.create(speakerData);

        // Create speaker with same email in second event (should succeed)
        const authorizedEvent2 = await getAuthorizedEvent(authorizedTeam, otherEvent.slug);
        const secondEventSpeakers = EventSpeakers.for(authorizedEvent2);
        const secondSpeaker = await secondEventSpeakers.create(speakerData);

        expect(firstSpeaker.email).toEqual(secondSpeaker.email);
        expect(firstSpeaker.id).not.toEqual(secondSpeaker.id);
      });
    });

    describe('when user does not have create speaker permission', () => {
      it('throws ForbiddenOperationError for reviewer', async () => {
        const reviewer = await userFactory();
        const reviewerTeam = await teamFactory({ reviewers: [reviewer] });
        const reviewerEvent = await eventFactory({ team: reviewerTeam });
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, reviewerTeam.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, reviewerEvent.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);

        const speakerData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        await expect(eventSpeakers.create(speakerData)).rejects.toThrow(ForbiddenOperationError);
      });
    });
  });

  describe('#update', () => {
    describe('when user has edit speaker permission', () => {
      it('updates a speaker with provided data', async () => {
        const updateData: EventSpeakerSaveData = {
          name: 'Updated Name',
          email: eventSpeaker1.email,
          picture: null,
          bio: 'Updated bio',
          references: null,
          company: 'Updated Company',
          location: 'Updated Location',
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updatedSpeaker = await eventSpeakers.update(eventSpeaker1.id, updateData);

        expect(updatedSpeaker.name).toBe('Updated Name');
        expect(updatedSpeaker.bio).toBe('Updated bio');
        expect(updatedSpeaker.company).toBe('Updated Company');
        expect(updatedSpeaker.location).toBe('Updated Location');
        expect(updatedSpeaker.email).toBe(eventSpeaker1.email);
      });

      it('updates only provided fields', async () => {
        const originalName = eventSpeaker1.name;

        const updateData: EventSpeakerSaveData = {
          name: eventSpeaker1.name,
          email: eventSpeaker1.email,
          picture: null,
          bio: 'New bio only',
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updatedSpeaker = await eventSpeakers.update(eventSpeaker1.id, updateData);

        expect(updatedSpeaker.name).toBe(originalName);
        expect(updatedSpeaker.bio).toBe('New bio only');
      });

      it('throws an error if speaker not found', async () => {
        const updateData: EventSpeakerSaveData = {
          name: 'Updated Name',
          email: 'test@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        await expect(eventSpeakers.update('non-existent-speaker-id', updateData)).rejects.toThrowError(NotFoundError);
      });

      it('throws an error if speaker belongs to different event', async () => {
        const otherEvent = await eventFactory({ team });
        const otherEventSpeaker = await eventSpeakerFactory({ event: otherEvent });

        const updateData: EventSpeakerSaveData = {
          name: 'Updated Name',
          email: 'test@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        await expect(eventSpeakers.update(otherEventSpeaker.id, updateData)).rejects.toThrowError(NotFoundError);
      });
    });

    describe('when user does not have edit speaker permission', () => {
      it('throws ForbiddenOperationError for reviewer', async () => {
        const reviewer = await userFactory();
        const reviewerTeam = await teamFactory({ reviewers: [reviewer] });
        const reviewerEvent = await eventFactory({ team: reviewerTeam });
        const reviewerEventSpeaker = await eventSpeakerFactory({ event: reviewerEvent });

        const authorizedTeam = await getAuthorizedTeam(reviewer.id, reviewerTeam.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, reviewerEvent.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updateData: EventSpeakerSaveData = {
          name: 'Updated Name',
          email: 'test@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        await expect(eventSpeakers.update(reviewerEventSpeaker.id, updateData)).rejects.toThrow(
          ForbiddenOperationError,
        );
      });
    });

    describe('email validation', () => {
      it('allows updating email to a new unique email', async () => {
        const updateData: EventSpeakerSaveData = {
          name: eventSpeaker1.name,
          email: 'newemail@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updatedSpeaker = await eventSpeakers.update(eventSpeaker1.id, updateData);

        expect(updatedSpeaker.email).toBe('newemail@example.com');
      });

      it('allows keeping the same email unchanged', async () => {
        const originalEmail = eventSpeaker1.email;
        const updateData: EventSpeakerSaveData = {
          email: originalEmail,
          name: 'Updated Name',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updatedSpeaker = await eventSpeakers.update(eventSpeaker1.id, updateData);

        expect(updatedSpeaker.email).toBe(originalEmail);
        expect(updatedSpeaker.name).toBe('Updated Name');
      });

      it('throws SpeakerEmailAlreadyExistsError when updating to existing email', async () => {
        const existingEmail = eventSpeaker2.email;
        const updateData: EventSpeakerSaveData = {
          name: eventSpeaker2.name,
          email: existingEmail,
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);

        // throw error when email already exists
        await expect(eventSpeakers.update(eventSpeaker1.id, updateData)).rejects.toThrow(
          SpeakerEmailAlreadyExistsError,
        );

        // throw error when email already exists with different case
        await expect(
          eventSpeakers.update(eventSpeaker1.id, { ...updateData, email: eventSpeaker2.email.toUpperCase() }),
        ).rejects.toThrow(SpeakerEmailAlreadyExistsError);
      });

      it('allows updating to same email in different event', async () => {
        const otherEvent = await eventFactory({ team });
        await eventSpeakerFactory({ event: otherEvent, attributes: { email: 'shared@example.com' } });

        const updateData: EventSpeakerSaveData = {
          name: eventSpeaker1.name,
          email: 'shared@example.com',
          picture: null,
          bio: null,
          references: null,
          company: null,
          location: null,
          socialLinks: [],
        };

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const eventSpeakers = EventSpeakers.for(authorizedEvent);
        const updatedSpeaker = await eventSpeakers.update(eventSpeaker1.id, updateData);

        expect(updatedSpeaker.email).toBe('shared@example.com');
      });
    });
  });
});
