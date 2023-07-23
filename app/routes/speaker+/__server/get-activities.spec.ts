import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

import { getActivities } from './get-activities.server';

describe('#getActivities', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns speaker activity with proposal submitted ordered by update date', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const event2 = await eventFactory();

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const proposal2 = await proposalFactory({ event: event2, talk: talk });

    const result = await getActivities(speaker.id);

    expect(result).toEqual({
      activities: [
        {
          slug: event2.slug,
          name: event2.name,
          logo: event2.logo,
          cfpState: 'CLOSED',
          submissions: [
            {
              id: proposal2.id,
              title: proposal2.title,
              updatedAt: proposal2.createdAt.toUTCString(),
              status: SpeakerProposalStatus.DeliberationPending,
              speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
            },
          ],
        },
        {
          slug: event.slug,
          name: event.name,
          logo: event.logo,
          cfpState: 'OPENED',
          submissions: [
            {
              id: proposal.id,
              title: proposal.title,
              updatedAt: proposal.createdAt.toUTCString(),
              status: SpeakerProposalStatus.Submitted,
              speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
            },
          ],
        },
      ],
      hasNextPage: false,
      nextPage: 2,
    });
  });
});
