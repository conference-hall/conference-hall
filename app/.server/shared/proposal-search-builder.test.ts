import type { Event, EventCategory, EventFormat, Proposal, Team, User } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { Pagination } from '~/.server/shared/pagination.ts';

import { ProposalSearchBuilder } from './proposal-search-builder.ts';
import type { ProposalsFilters } from './proposal-search-builder.types.ts';

describe('EventProposalsSearch', () => {
  let owner: User, speaker: User;
  let team: Team;
  let event: Event, event2: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal1: Proposal, proposal2: Proposal, proposal3: Proposal, proposal4: Proposal, proposal5: Proposal;

  beforeEach(async () => {
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
    const talk4 = await talkFactory({ speakers: [speaker] });
    const talk5 = await talkFactory({ speakers: [speaker] });

    proposal1 = await proposalFactory({
      event,
      talk: talk1,
      attributes: { title: 'Hello World' },
      formats: [format],
    });
    proposal2 = await proposalFactory({
      event,
      talk: talk2,
      attributes: { title: 'Awesome talk' },
      categories: [category],
      traits: ['confirmed'],
    });
    proposal3 = await proposalFactory({
      event,
      talk: talk3,
      attributes: { title: 'Foo bar talk' },
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
    await proposalFactory({ event: event2, talk: talk3 });

    await reviewFactory({ user: speaker, proposal: proposal1, attributes: { feeling: 'NEGATIVE', note: 0 } });
    await reviewFactory({ user: owner, proposal: proposal1, attributes: { feeling: 'POSITIVE', note: 5 } });
    await reviewFactory({ user: owner, proposal: proposal3, attributes: { feeling: 'POSITIVE', note: 1 } });
  });

  describe('#search.statisics', () => {
    it('returns statistics search info', async () => {
      const search = new ProposalSearchBuilder(event.slug, owner.id, {});

      const statistics = await search.statistics();
      expect(statistics.total).toEqual(5);
      expect(statistics.reviewed).toEqual(2);
    });
  });

  describe('#search.proposalsByPage', () => {
    it('returns proposals according the page index', async () => {
      const search = new ProposalSearchBuilder(event.slug, owner.id, {});

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
    it('filters proposals by title', async () => {
      const filters = { query: 'world' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal1.title);
    });

    it('filters proposals by speaker name', async () => {
      const filters = { query: 'parker' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(4);
    });

    it('does not filter proposals by speaker name when searchBySpeakers option is false', async () => {
      const filters = { query: 'parker' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters, { withSpeakers: false });
      const proposals = await search.proposals();
      expect(proposals.length).toBe(0);
    });

    it('filters proposals by formats', async () => {
      const filters = { formats: format.id };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal1.title);
    });

    it('filters proposals by categories', async () => {
      const filters = { categories: category.id };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal2.title);
    });

    it('filters proposals by status pending', async () => {
      const filters: ProposalsFilters = { status: 'pending' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal1.title);
    });

    it('filters proposals by status accepted', async () => {
      const filters: ProposalsFilters = { status: 'accepted' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].title).toBe(proposal5.title);
      expect(proposals[1].title).toBe(proposal4.title);
      expect(proposals[2].title).toBe(proposal2.title);
    });

    it('filters proposals by status rejected', async () => {
      const filters: ProposalsFilters = { status: 'rejected' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal3.title);
    });

    it('filters proposals by status not-answered', async () => {
      const filters: ProposalsFilters = { status: 'not-answered' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal4.title);
    });

    it('filters proposals by status confirmed', async () => {
      const filters: ProposalsFilters = { status: 'confirmed' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal2.title);
    });

    it('filters proposals by status declined', async () => {
      const filters: ProposalsFilters = { status: 'declined' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(1);
      expect(proposals[0].title).toBe(proposal5.title);
    });

    it('filters proposals by user reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'reviewed' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(2);
      expect(proposals[0].title).toBe(proposal3.title);
      expect(proposals[1].title).toBe(proposal1.title);
    });

    it('filters proposals by user not reviewed only', async () => {
      const filters: ProposalsFilters = { reviews: 'not-reviewed' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(3);
      expect(proposals[0].title).toBe(proposal5.title);
      expect(proposals[1].title).toBe(proposal4.title);
      expect(proposals[2].title).toBe(proposal2.title);
    });

    it('sorts by newest (default)', async () => {
      const search = new ProposalSearchBuilder(event.slug, owner.id, {});
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].title).toBe(proposal5.title);
      expect(proposals[1].title).toBe(proposal4.title);
      expect(proposals[2].title).toBe(proposal3.title);
      expect(proposals[3].title).toBe(proposal2.title);
      expect(proposals[4].title).toBe(proposal1.title);
    });

    it('sorts by oldest', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].title).toBe(proposal1.title);
      expect(proposals[1].title).toBe(proposal2.title);
      expect(proposals[2].title).toBe(proposal3.title);
      expect(proposals[3].title).toBe(proposal4.title);
      expect(proposals[4].title).toBe(proposal5.title);
    });

    it('sort by highest reviews', async () => {
      const filters: ProposalsFilters = { sort: 'highest' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].title).toBe(proposal1.title);
      expect(proposals[1].title).toBe(proposal3.title);
      expect(proposals[2].title).toBe(proposal2.title);
      expect(proposals[3].title).toBe(proposal4.title);
      expect(proposals[4].title).toBe(proposal5.title);
    });

    it('sort by lowest reviews', async () => {
      const filters: ProposalsFilters = { sort: 'lowest' };
      const search = new ProposalSearchBuilder(event.slug, owner.id, filters);
      const proposals = await search.proposals();
      expect(proposals.length).toBe(5);
      expect(proposals[0].title).toBe(proposal2.title);
      expect(proposals[1].title).toBe(proposal4.title);
      expect(proposals[2].title).toBe(proposal5.title);
      expect(proposals[3].title).toBe(proposal3.title);
      expect(proposals[4].title).toBe(proposal1.title);
    });
  });

  it('should not return draft proposals', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const search = new ProposalSearchBuilder(event.slug, owner.id, {});
    const proposals = await search.proposals();

    expect(proposals.length).toBe(5);
  });
});
