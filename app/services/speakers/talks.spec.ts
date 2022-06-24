import { eventFactory } from '../../../tests/factories/events';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { TalkNotFoundError } from '../errors';
import { findTalks, getTalk } from './talks.server';

describe('#findTalks', () => {
  it('returns speaker talks list', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await talkFactory({ speakers: [speaker], attributes: { archived: true } });

    const otherSpeaker = await userFactory();
    await talkFactory({ speakers: [otherSpeaker] });

    const result = await findTalks(speaker.id);

    expect(result).toEqual([
      {
        id: talk.id,
        title: talk.title,
        archived: false,
        createdAt: talk.createdAt.toISOString(),
        speakers: [{ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL }],
      },
    ]);
  });

  it('returns talks when co-speaker', async () => {
    const owner = await userFactory();
    await talkFactory({ speakers: [owner] });

    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [owner, cospeaker] });

    const result = await findTalks(cospeaker.id);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(talk.id);

    const speakerIds = result[0].speakers.map(({ id }) => id).sort();
    expect(speakerIds).toEqual([owner.id, cospeaker.id].sort());
  });

  it('returns archived talks when archived option is set', async () => {
    const speaker = await userFactory();
    await talkFactory({ speakers: [speaker] });
    const talk = await talkFactory({ speakers: [speaker], attributes: { archived: true } });

    const result = await findTalks(speaker.id, { archived: true });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(talk.id);
  });
});

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
      createdAt: talk.createdAt.toISOString(),
      isOwner: true,
      speakers: [
        { id: speaker.id, name: speaker.name, photoURL: speaker.photoURL, isOwner: true, isCurrentUser: true },
      ],
      proposals: [],
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
      { id: owner.id, name: owner.name, photoURL: owner.photoURL, isOwner: true, isCurrentUser: false },
      { id: cospeaker.id, name: cospeaker.name, photoURL: cospeaker.photoURL, isOwner: false, isCurrentUser: true },
    ]);
  });

  it('returns the talk invitation link when invitation generated', async () => {
    const speaker = await userFactory();
    const invite = await inviteFactory({
      attributes: { type: 'TALK', invitedBy: { connect: { id: speaker.id } } },
    });
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { invitation: { connect: { id: invite.id } } },
    });

    const result = await getTalk(speaker.id, talk.id);

    expect(result.id).toBe(talk.id);
    expect(result.invitationLink).toBe(`http://localhost:3000/invitation/${invite.id}`);
  });

  it('returns proposals when talk submitted', async () => {
    const speaker = await userFactory();
    const event = await eventFactory()
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ talk, event });

    const result = await getTalk(speaker.id, talk.id);

    expect(result.proposals).toEqual([
      {
        date: proposal.updatedAt.toISOString(),
        eventName: proposal.event.name,
        eventSlug: proposal.event.slug,
        status: 'SUBMITTED',
      },
    ]);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(getTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
