import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../../libs/errors';
import { searchProposals } from './search-proposals.server';

describe('#searchProposals', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
  });

  afterEach(disconnectDB);

  it('returns event proposals info', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposals = await searchProposals(organization.slug, event.slug, owner.id, { status: ['SUBMITTED'] });

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

    expect(proposals.filters).toEqual({ status: ['SUBMITTED'] });
    expect(proposals.statistics).toEqual({ reviewed: 0, statuses: [{ name: 'SUBMITTED', count: 1 }], total: 1 });
    expect(proposals.pagination).toEqual({ current: 1, total: 1 });
  });

  it('returns empty results of an event without proposals', async () => {
    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.results).toEqual([]);

    expect(proposals.filters).toEqual({});
    expect(proposals.statistics).toEqual({ reviewed: 0, statuses: [], total: 0 });
    expect(proposals.pagination).toEqual({ current: 1, total: 0 });
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
