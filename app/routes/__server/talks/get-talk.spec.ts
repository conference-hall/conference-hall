import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { config } from '~/libs/config.ts';
import { TalkNotFoundError } from '~/libs/errors.ts';

import { SpeakerProposalStatus } from '../proposals/get-speaker-proposal-status.ts';
import { getTalk } from './get-talk.server.ts';

describe('#getTalk', () => {
  it('returns speaker talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const result = await getTalk(speaker.id, talk.id);

    expect(result).toEqual({
      id: talk.id,
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      languages: talk.languages,
      references: talk.references,
      archived: talk.archived,
      createdAt: talk.createdAt.toUTCString(),
      invitationLink: `${config.appUrl}/invite/talk/${talk.invitationCode}`,
      isOwner: true,
      speakers: [
        {
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          isOwner: true,
          isCurrentUser: true,
        },
      ],
      submissions: [],
    });
  });

  it('returns cospeaker talk', async () => {
    const owner = await userFactory();
    const cospeaker = await userFactory();
    await talkFactory({ speakers: [owner] });
    const talk = await talkFactory({ speakers: [owner, cospeaker] });

    const result = await getTalk(cospeaker.id, talk.id);

    expect(result.id).toBe(talk.id);
    expect(result.isOwner).toBe(false);
    expect(result.speakers).toEqual([
      {
        id: owner.id,
        name: owner.name,
        picture: owner.picture,
        isOwner: true,
        isCurrentUser: false,
      },
      {
        id: cospeaker.id,
        name: cospeaker.name,
        picture: cospeaker.picture,
        isOwner: false,
        isCurrentUser: true,
      },
    ]);
  });

  it('returns proposals when talk submitted', async () => {
    const speaker = await userFactory();
    const event = await eventFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ talk, event });

    const result = await getTalk(speaker.id, talk.id);

    expect(result.submissions).toEqual([
      {
        name: proposal.event.name,
        slug: proposal.event.slug,
        logo: proposal.event.logo,
        proposalStatus: SpeakerProposalStatus.DeliberationPending,
      },
    ]);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(getTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
