import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { searchProposals } from './search-proposals.server.ts';

describe('#searchProposals', () => {
  let owner: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
  });

  it('returns event proposals info', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposals = await searchProposals(event.slug, owner.id, { status: ['SUBMITTED'] });

    expect(proposals.results).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: null,
        emailRejectedStatus: null,
        speakers: [speaker.name],
        reviews: {
          summary: { negatives: 0, positives: 0, average: null },
          you: { note: null, feeling: null, comment: null },
        },
      },
    ]);

    expect(proposals.filters).toEqual({ status: ['SUBMITTED'] });
    expect(proposals.statistics).toEqual({ reviewed: 0, statuses: [{ name: 'SUBMITTED', count: 1 }], total: 1 });
    expect(proposals.pagination).toEqual({ current: 1, total: 1 });
  });

  it('does not return speakers when display proposal speakers is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    let proposals = await searchProposals(event.slug, owner.id, {});
    expect(proposals.results[0]?.speakers).toEqual([]);

    proposals = await searchProposals(event.slug, owner.id, { query: 'parker' });
    expect(proposals.results.length).toEqual(0);
  });

  it('does not return reviews when display proposal reviews is false', async () => {
    await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    let proposals = await searchProposals(event.slug, owner.id, {});
    expect(proposals.results[0].reviews.summary).toBeUndefined();
  });

  it('returns empty results of an event without proposals', async () => {
    const proposals = await searchProposals(event.slug, owner.id, {});

    expect(proposals.results).toEqual([]);

    expect(proposals.filters).toEqual({});
    expect(proposals.statistics).toEqual({ reviewed: 0, statuses: [], total: 0 });
    expect(proposals.pagination).toEqual({ current: 1, total: 0 });
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(searchProposals(event.slug, user.id, {})).rejects.toThrowError(ForbiddenOperationError);
  });
});
