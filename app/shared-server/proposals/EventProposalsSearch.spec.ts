import type { Event, EventCategory, EventFormat, Team, Proposal, User } from '@prisma/client';
import type { ProposalsFilters } from '~/schemas/proposal';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { reviewFactory } from 'tests/factories/reviews';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { EventProposalsSearch } from './EventProposalsSearch';
import { sortBy } from '~/utils/arrays';

describe('#searchProposals', () => {
  let owner: User, speaker: User;
  let team: Team;
  let event: Event, event2: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal1: Proposal, proposal2: Proposal, proposal3: Proposal;

  beforeEach(async () => {
    await resetDB();

    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    event2 = await eventFactory();

    const talk1 = await talkFactory({ speakers: [speaker] });
    const talk2 = await talkFactory({ speakers: [owner] });
    const talk3 = await talkFactory({ speakers: [speaker, owner] });

    proposal1 = await proposalFactory({
      event,
      talk: talk1,
      attributes: { title: 'Hello World' },
      formats: [format],
      traits: ['submitted'],
    });
    proposal2 = await proposalFactory({
      event,
      talk: talk2,
      attributes: { title: 'Awesome talk' },
      categories: [category],
      traits: ['accepted'],
    });
    proposal3 = await proposalFactory({
      event,
      talk: talk3,
      attributes: { title: 'Foo bar talk' },
      traits: ['rejected'],
    });
    await proposalFactory({
      event: event2,
      talk: talk3,
      traits: ['submitted'],
    });

    await reviewFactory({ user: speaker, proposal: proposal1, attributes: { feeling: 'NEGATIVE', note: 0 } });
    await reviewFactory({ user: owner, proposal: proposal1, attributes: { feeling: 'POSITIVE', note: 5 } });
  });

  afterEach(disconnectDB);

  describe('#search.statisics', () => {
    it('returns statistics search info', async () => {
      const search = new EventProposalsSearch(event.slug, owner.id, {});

      const statistics = await search.statistics();
      expect(statistics.total).toEqual(3);
      expect(statistics.reviewed).toEqual(1);
      expect(sortBy(statistics.statuses, 'name')).toEqual(
        sortBy(
          [
            { name: 'SUBMITTED', count: 1 },
            { name: 'ACCEPTED', count: 1 },
            { name: 'REJECTED', count: 1 },
          ],
          'name'
        )
      );
    });
  });

  describe('#search.proposalsByPage', () => {
    it('returns proposals according the page index', async () => {
      const search = new EventProposalsSearch(event.slug, owner.id, {});

      const statistics = await search.statistics();
      expect(statistics.total).toEqual(3);

      const proposalsPage1 = await search.proposalsByPage(0, 2);
      expect(proposalsPage1.length).toEqual(2);

      const proposalsPage2 = await search.proposalsByPage(1, 2);
      expect(proposalsPage2.length).toEqual(1);
    });
  });

  describe('searchs with filters and sorting', () => {
    beforeEach(async () => {});

    it('filters proposals by title', async () => {
      const filters = { query: 'world' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('filters proposals by speaker name', async () => {
      const filters = { query: 'parker' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(2);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal1.id);
    });

    it('does not filter proposals by speaker name when searchBySpeakers option is false', async () => {
      const filters = { query: 'parker' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters, { searchBySpeakers: false });
      const proposals = await search.proposals();
      expect(proposals.length).toBe(0);
    });

    it('filters proposals by formats', async () => {
      const filters = { formats: format.id };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('filters proposals by categories', async () => {
      const filters = { categories: category.id };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal2.id);
    });

    it('filters proposals by status', async () => {
      const filters: ProposalsFilters = { status: ['ACCEPTED'] };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal2.id);
    });

    it('filters proposals by user reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'reviewed' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(proposal1.id);
    });

    it('filters proposals by user not reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'not-reviewed' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(2);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal2.id);
    });

    it('sorts by newest (default)', async () => {
      const search = new EventProposalsSearch(event.slug, owner.id, {});
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].id).toBe(proposal3.id);
      expect(proposals[1].id).toBe(proposal2.id);
      expect(proposals[2].id).toBe(proposal1.id);
    });

    it('sorts by oldest', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const search = new EventProposalsSearch(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].id).toBe(proposal1.id);
      expect(proposals[1].id).toBe(proposal2.id);
      expect(proposals[2].id).toBe(proposal3.id);
    });

    it.todo('sort by lowest reviews');
    it.todo('sort by highest reviews');
  });

  it('should not return draft proposals', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const search = new EventProposalsSearch(event.slug, owner.id, {});
    const proposals = await search.proposals();

    expect(proposals.length).toBe(3);
  });
});
