import type { Event, EventCategory, EventFormat, Organization, Proposal, User } from '@prisma/client';
import type { ProposalsFilters } from '~/schemas/proposal';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { ratingFactory } from 'tests/factories/ratings';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../../libs/errors';
import { searchProposals } from './search-proposals.server';

describe('#searchProposals', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event, event2: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    event2 = await eventFactory();
  });
  afterEach(disconnectDB);

  it('returns event proposals info', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [owner] }) });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.filters).toEqual({});
    expect(proposals.pagination).toEqual({ current: 1, total: 1 });
    expect(proposals.results.length).toEqual(1);
    expect(proposals.results).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: null,
        emailRejectedStatus: null,
        speakers: [speaker.name],
        ratings: { negatives: 0, positives: 0, you: null, total: null },
      },
    ]);
  });

  describe('with filters and sorting', () => {
    let proposal1: Proposal, proposal2: Proposal, proposal3: Proposal;

    beforeEach(async () => {
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
    });

    it('filters proposals by title', async () => {
      const filters = { query: 'world' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.filters).toEqual(filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by speaker name', async () => {
      const filters = { query: 'parker' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(2);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal1.id);
    });

    it('filters proposals by formats', async () => {
      const filters = { formats: format.id };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by categories', async () => {
      const filters = { categories: category.id };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal2.id);
    });

    it('filters proposals by status', async () => {
      const filters: ProposalsFilters = { status: ['ACCEPTED'] };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal2.id);
    });

    it('filters proposals by user rated only', async () => {
      await ratingFactory({ user: owner, proposal: proposal1 });
      const filters: ProposalsFilters = { ratings: 'rated' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by user not rated only', async () => {
      await ratingFactory({ user: owner, proposal: proposal1 });
      const filters: ProposalsFilters = { ratings: 'not-rated' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(2);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
    });

    it('sorts by newest (default)', async () => {
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});
      expect(proposals.results.length).toBe(3);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
      expect(proposals.results[2].id).toBe(proposal1.id);
    });

    it('sorts by oldest', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(3);
      expect(proposals.results[0].id).toBe(proposal1.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
      expect(proposals.results[2].id).toBe(proposal3.id);
    });

    it.todo('sort by lowest ratings');
    it.todo('sort by highest ratings');
  });

  it('returns the given page', async () => {
    await Promise.all(
      Array.from({ length: 26 }).map(async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        return proposalFactory({ event, talk });
      })
    );

    const result = await searchProposals(organization.slug, event.slug, owner.id, {}, 1);
    expect(result.total).toBe(26);
    expect(result.results.length).toBe(25);
    expect(result.pagination.current).toBe(1);
    expect(result.pagination.total).toBe(2);

    const result2 = await searchProposals(organization.slug, event.slug, owner.id, {}, 2);
    expect(result2.results.length).toBe(1);
    expect(result2.pagination.current).toBe(2);
    expect(result2.pagination.total).toBe(2);

    const result3 = await searchProposals(organization.slug, event.slug, owner.id, {}, -1);
    expect(result3.results.length).toBe(25);
    expect(result3.pagination.current).toBe(1);

    const result4 = await searchProposals(organization.slug, event.slug, owner.id, {}, 10);
    expect(result4.results.length).toBe(1);
    expect(result4.pagination.current).toBe(2);
  });

  it('returns empty results of an event without proposals', async () => {
    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.filters).toEqual({});
    expect(proposals.pagination).toEqual({ current: 1, total: 0 });
    expect(proposals.results).toEqual([]);
  });

  it('should not return draft proposals', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.total).toBe(0);
    expect(proposals.results).toEqual([]);
  });

  it('returns users ratings', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    await ratingFactory({ user: speaker, proposal, attributes: { feeling: 'NEGATIVE', rating: 0 } });
    await ratingFactory({ user: owner, proposal, attributes: { feeling: 'POSITIVE', rating: 5 } });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.total).toBe(1);
    expect(proposals.results[0].ratings).toEqual({ negatives: 1, positives: 1, you: 5, total: 2.5 });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(searchProposals(organization.slug, event.slug, user.id, {})).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
