import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { exportProposals } from './export-proposals.server';

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

    const result = await exportProposals(organization.slug, event.slug, owner.id, {});

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
        ratings: {
          negatives: 0,
          positives: 0,
          total: null,
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
});
