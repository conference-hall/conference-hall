import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { inviteFactory } from 'tests/factories/invite';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { config } from '../../libs/config';
import { TalkNotFoundError } from '../../libs/errors';
import { getTalk } from './get-talk.server';
import { SpeakerProposalStatus } from '../proposals/get-speaker-proposal-status';

describe('#getTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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
      isOwner: true,
      speakers: [
        {
          id: speaker.id,
          name: speaker.name,
          photoURL: speaker.photoURL,
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
        photoURL: owner.photoURL,
        isOwner: true,
        isCurrentUser: false,
      },
      {
        id: cospeaker.id,
        name: cospeaker.name,
        photoURL: cospeaker.photoURL,
        isOwner: false,
        isCurrentUser: true,
      },
    ]);
  });

  it('returns the talk invitation link when invitation generated', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const invite = await inviteFactory({ talk });

    const result = await getTalk(speaker.id, talk.id);

    expect(result.id).toBe(talk.id);
    expect(result.invitationLink).toBe(`${config.appUrl}/invitation/${invite?.id}`);
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
        proposalStatus: SpeakerProposalStatus.DeliberationPending,
      },
    ]);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(getTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
