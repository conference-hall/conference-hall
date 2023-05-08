import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { exportProposals } from './export-proposals.server';
import { db } from '~/libs/db';

describe('#exportProposals', () => {
  let owner: User, reviewer: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('export a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        languages: proposal.languages,
        level: proposal.level,
        categories: [],
        formats: [],
        ratings: {
          negatives: 0,
          positives: 0,
          average: null,
        },
        speakers: [speaker.name],
      },
    ]);
  });

  it('does not export speakers when display speakers setting is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result[0].speakers).toBeUndefined();
  });

  it('does not export ratings when display ratings setting is false', async () => {
    await db.event.update({ data: { displayProposalsRatings: false }, where: { id: event.id } });

    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result[0].ratings).toBeUndefined();
  });
});
