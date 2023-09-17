import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status.ts';

import { listSpeakerProposals } from './list-speaker-proposals.server.ts';

describe('#listSpeakerProposals', () => {
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
