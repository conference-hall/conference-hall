import { resetDB } from 'tests/db-helpers.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import type {
  Event,
  EventCategory,
  EventFormat,
  EventProposalTag,
  EventSpeaker,
  Proposal,
  Team,
  User,
} from '../../../../../prisma/generated/client.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from './proposal-search-builder.server.ts';

// Global afterEach is disabled  with 'no-teardown' tag to improve test performances
// It creates data once for all tests
describe('EventProposalsSearch', { tags: ['no-teardown'] }, () => {
  let owner: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let event2: Event;
  let format: EventFormat;
  let category: EventCategory;
  let tag: EventProposalTag;
  let proposal1: Proposal;
  let proposal2: Proposal;
  let proposal3: Proposal;
  let proposal4: Proposal;
  let proposal5: Proposal;
  let proposal6: Proposal;
  let eventSpeaker: EventSpeaker;

  beforeAll(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    tag = await eventProposalTagFactory({ event });
    event2 = await eventFactory();
    eventSpeaker = await eventSpeakerFactory({ event, user: speaker });

    const talk1 = await talkFactory({ speakers: [speaker] });
    const talk2 = await talkFactory({ speakers: [owner] });
    const talk3 = await talkFactory({ speakers: [speaker, owner] });
    const talk4 = await talkFactory({ speakers: [speaker] });
    const talk5 = await talkFactory({ speakers: [speaker] });
    const talk6 = await talkFactory({ speakers: [speaker] });
    const talk7 = await talkFactory({ speakers: [speaker] });

    proposal1 = await proposalFactory({
      event,
      talk: talk1,
      attributes: { title: 'Hello World', proposalNumber: 123 },
      formats: [format],
    });
    proposal2 = await proposalFactory({
      event,
      talk: talk2,
      attributes: { title: 'Awesome talk', proposalNumber: 456 },
      categories: [category],
      traits: ['confirmed'],
    });
    proposal3 = await proposalFactory({
      event,
      talk: talk3,
      attributes: { title: 'Foo bar talk 456', proposalNumber: 789 },
      tags: [tag],
      traits: ['rejected'],
    });
    proposal4 = await proposalFactory({
      event,
      talk: talk4,
      attributes: { title: 'Other 1' },
      traits: ['accepted-published'],
    });
    proposal5 = await proposalFactory({
      event,
      talk: talk5,
      attributes: { title: 'Other 2' },
      traits: ['declined'],
    });
    proposal6 = await proposalFactory({
      event,
      talk: talk6,
      attributes: { title: 'Other 3' },
      traits: ['archived'],
    });
    await proposalFactory({ event, talk: talk7, traits: ['draft'] });
    await proposalFactory({ event: event2, talk: talk3 });

    await reviewFactory({ user: speaker, proposal: proposal1, attributes: { feeling: 'NEGATIVE', note: 0 } });
    await reviewFactory({ user: speaker, proposal: proposal2, attributes: { feeling: 'POSITIVE', note: 5 } });
    await reviewFactory({ user: owner, proposal: proposal1, attributes: { feeling: 'POSITIVE', note: 5 } });
    await reviewFactory({ user: owner, proposal: proposal2, attributes: { feeling: 'NEUTRAL', note: 5 } });
    await reviewFactory({ user: owner, proposal: proposal3, attributes: { feeling: 'NEUTRAL', note: 1 } });

    await commentFactory({ user: owner, proposal: proposal1 });
    await commentFactory({ user: owner, proposal: proposal3 });
    await commentFactory({ user: owner, proposal: proposal3 });
  });

  afterAll(async () => {
    await resetDB();
  });

  describe('#search.statisics', () => {
    it('returns statistics search info', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});

      const statistics = await search.statistics();
      expect(statistics.total).toEqual(5);
      expect(statistics.reviewed).toEqual(3);
    });
  });

  describe('#search.proposalsByPage', () => {
    it('returns proposals according the page index', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});

      const statistics = await search.statistics();
      expect(statistics.total).toEqual(5);

      const pagination = new Pagination({ page: 1, total: statistics.total, pageSize: 2 });
      const proposalsPage1 = await search.proposalsByPage(pagination);
      expect(proposalsPage1.length).toEqual(2);

      const pagination2 = new Pagination({ page: 3, total: statistics.total, pageSize: 2 });
      const proposalsPage2 = await search.proposalsByPage(pagination2);
      expect(proposalsPage2.length).toEqual(1);
    });
  });

  describe('searchs with filters and sorting', () => {
    it('default search', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
    });

    it('filters proposals by title', async () => {
      const filters = { query: 'world' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal1.title);
    });

    it('filters proposals by speaker name', async () => {
      const filters = { query: 'parker' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(4);
    });

    it('does not filter proposals by speaker name when withSpeakers option is false', async () => {
      const filters = { query: 'parker' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters, {
        withSpeakers: false,
        withReviews: false,
      });
      const proposals = await search.proposals();
      expect(proposals.length).toBe(0);
    });

    it('filters proposals by proposal number', async () => {
      const filters = { query: '123' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals.some((p) => p.id === proposal1.id)).toBe(true);
    });

    it('filters proposals by proposal number with hash prefix', async () => {
      const filters = { query: '#123' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals.some((p) => p.id === proposal1.id)).toBe(true);
    });

    it('filters proposals by proposal number with whitespace around proposal number', async () => {
      const filters = { query: '  123  ' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals.some((p) => p.id === proposal1.id)).toBe(true);
    });

    it('searches proposal number OR title OR speaker with numeric query', async () => {
      const filters = { query: '456' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(2);
      expect(proposals.some((p) => p.id === proposal2.id)).toBe(true);
      expect(proposals.some((p) => p.id === proposal3.id)).toBe(true);
    });

    it('escapes ILIKE special characters in search query', async () => {
      const filters = { query: 'Awe%me' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(0);
    });

    it('escapes underscore wildcard in search query', async () => {
      const filters = { query: 'Awe_ome' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(0);
    });

    it('does not search by proposal number when query contains non-numeric characters', async () => {
      const filters = { query: 'talk 456' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal3.id);
    });

    it('filters proposals by formats', async () => {
      const filters = { formats: format.id };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('filters proposals by categories', async () => {
      const filters = { categories: category.id };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal2.id);
    });

    it('filters proposals by tags', async () => {
      const filters = { tags: tag.id };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal3.id);
    });

    it('filters proposals by speakers', async () => {
      const filters = { speakers: eventSpeaker.id };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(4);
      expect(proposals[0].id).toBe(proposal5.id);
      expect(proposals[1].id).toBe(proposal4.id);
      expect(proposals[2].id).toBe(proposal3.id);
      expect(proposals[3].id).toBe(proposal1.id);
    });

    it('filters proposals by status pending', async () => {
      const filters: ProposalsFilters = { status: 'pending' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('filters proposals by status accepted', async () => {
      const filters: ProposalsFilters = { status: 'accepted' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].id).toBe(proposal5.id);
      expect(proposals[1].id).toBe(proposal4.id);
      expect(proposals[2].id).toBe(proposal2.id);
    });

    it('filters proposals by status rejected', async () => {
      const filters: ProposalsFilters = { status: 'rejected' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal3.id);
    });

    it('filters proposals by status not-answered', async () => {
      const filters: ProposalsFilters = { status: 'not-answered' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal4.id);
    });

    it('filters proposals by status confirmed', async () => {
      const filters: ProposalsFilters = { status: 'confirmed' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal2.id);
    });

    it('filters proposals by status declined', async () => {
      const filters: ProposalsFilters = { status: 'declined' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal5.id);
    });

    it('shows only archived proposals with status=archived', async () => {
      const filters: ProposalsFilters = { status: 'archived' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal6.id);
    });

    it('filters proposals by user reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'reviewed' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal2.id);
      expect(proposals[2].id).toBe(proposal1.id);
    });

    it('filters proposals by user not reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'not-reviewed' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(2);
      expect(proposals[0].id).toBe(proposal5.id);
      expect(proposals[1].id).toBe(proposal4.id);
    });

    it('filters proposals by user favorite reviews only', async () => {
      const filters: ProposalsFilters = { reviews: 'my-favorites' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('sorts by newest (default)', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal5.id);
      expect(proposals[1].id).toBe(proposal4.id);
      expect(proposals[2].id).toBe(proposal3.id);
      expect(proposals[3].id).toBe(proposal2.id);
      expect(proposals[4].id).toBe(proposal1.id);
    });

    it('sorts by oldest', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal1.id);
      expect(proposals[1].id).toBe(proposal2.id);
      expect(proposals[2].id).toBe(proposal3.id);
      expect(proposals[3].id).toBe(proposal4.id);
      expect(proposals[4].id).toBe(proposal5.id);
    });

    it('sort by highest reviews', async () => {
      const filters: ProposalsFilters = { sort: 'highest' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal2.id);
      expect(proposals[1].id).toBe(proposal1.id);
      expect(proposals[2].id).toBe(proposal3.id);
      expect(proposals[3].id).toBe(proposal4.id);
      expect(proposals[4].id).toBe(proposal5.id);
    });

    it('sort by lowest reviews and no reviews last', async () => {
      const filters: ProposalsFilters = { sort: 'lowest' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal1.id);
      expect(proposals[2].id).toBe(proposal2.id);
      expect(proposals[3].id).toBe(proposal4.id);
      expect(proposals[4].id).toBe(proposal5.id);
    });

    it('sort by most comments', async () => {
      const filters: ProposalsFilters = { sort: 'most-comments' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal1.id);
      expect(proposals[2].id).toBe(proposal2.id);
      expect(proposals[3].id).toBe(proposal4.id);
      expect(proposals[4].id).toBe(proposal5.id);
    });

    it('sort by fewest comments and no comments last', async () => {
      const filters: ProposalsFilters = { sort: 'fewest-comments' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].id).toBe(proposal1.id);
      expect(proposals[1].id).toBe(proposal3.id);
      expect(proposals[2].id).toBe(proposal2.id);
      expect(proposals[3].id).toBe(proposal4.id);
      expect(proposals[4].id).toBe(proposal5.id);
    });
  });

  describe('#search.proposalIds', () => {
    it('returns array of proposal IDs only', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});

      const ids = await search.proposalIds();

      expect(ids.length).toBe(5);
      expect(ids).toEqual([proposal5.id, proposal4.id, proposal3.id, proposal2.id, proposal1.id]);
    });

    it('respects filters when returning proposal IDs', async () => {
      const filters = { query: 'world' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const ids = await search.proposalIds();

      expect(ids.length).toBe(1);
      expect(ids[0]).toBe(proposal1.id);
    });

    it('respects sorting when returning proposal IDs', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const ids = await search.proposalIds();

      expect(ids.length).toBe(5);
      expect(ids).toEqual([proposal1.id, proposal2.id, proposal3.id, proposal4.id, proposal5.id]);
    });

    it('returns empty array when no proposals match filters', async () => {
      const filters = { query: 'nonexistent' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const ids = await search.proposalIds();

      expect(ids).toEqual([]);
    });
  });

  describe('#search.proposalRouteIds', () => {
    it('returns array of objects with id and routeId', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});

      const routeIds = await search.proposalRouteIds();

      expect(routeIds.length).toBe(5);
      routeIds.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('routeId');
      });
    });

    it('returns routeId as proposal number when available', async () => {
      const search = new ProposalSearchBuilder(event.id, owner.id, {});
      const routeIds = await search.proposalRouteIds();

      const proposal1RouteId = routeIds.find((item) => item.id === proposal1.id);
      expect(proposal1RouteId?.routeId).toBe('123');
    });

    it('respects filters when returning route IDs', async () => {
      const filters = { query: 'world' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const routeIds = await search.proposalRouteIds();

      expect(routeIds.length).toBe(1);
      expect(routeIds[0].id).toBe(proposal1.id);
      expect(routeIds[0].routeId).toBe('123');
    });

    it('respects sorting when returning route IDs', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const routeIds = await search.proposalRouteIds();

      expect(routeIds.length).toBe(5);
      expect(routeIds[0].id).toBe(proposal1.id);
      expect(routeIds[1].id).toBe(proposal2.id);
    });

    it('returns empty array when no proposals match filters', async () => {
      const filters = { query: 'nonexistent' };
      const search = new ProposalSearchBuilder(event.id, owner.id, filters);

      const routeIds = await search.proposalRouteIds();

      expect(routeIds).toEqual([]);
    });
  });
});
