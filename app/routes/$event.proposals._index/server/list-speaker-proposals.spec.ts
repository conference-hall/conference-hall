import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { SpeakerProposalStatus } from '~/server/proposals/get-speaker-proposal-status';

import { listSpeakerProposals } from './list-speaker-proposals.server';

describe('#listSpeakerProposals', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns event proposals of the speaker', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const event2 = await eventFactory();

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    await proposalFactory({ event: event2, talk });

    const otherSpeaker = await userFactory();
    const otherTalk = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk: otherTalk });

    const results = await listSpeakerProposals(event.slug, speaker.id);

    expect(results).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        talkId: proposal.talkId,
        status: SpeakerProposalStatus.Submitted,
        createdAt: proposal.createdAt.toUTCString(),
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
          },
        ],
      },
    ]);
  });
});
