import type { Event, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';

import { exportProposals } from './export-json.server';

describe('#exportProposals', () => {
  let owner: User, reviewer: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('export a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        abstract: proposal.abstract,
        comments: proposal.comments,
        languages: proposal.languages,
        references: proposal.references,
        level: proposal.level,
        categories: [],
        formats: [],
        reviews: {
          negatives: 0,
          positives: 0,
          average: null,
        },
        speakers: [
          {
            name: speaker.name,
            email: speaker.email,
            bio: speaker.bio,
            picture: speaker.picture,
            company: speaker.company,
            address: speaker.address,
            references: speaker.references,
            socials: speaker.socials,
          },
        ],
      },
    ]);
  });

  it('does not export speakers when display speakers setting is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result[0].speakers).toBeUndefined();
  });

  it('does not export reviews when display reviews setting is false', async () => {
    await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });

    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const result = await exportProposals(event.slug, owner.id, {});

    expect(result[0].reviews).toBeUndefined();
  });
});
