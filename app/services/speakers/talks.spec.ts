import { TalkLevel } from '@prisma/client';
import { resetDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { config } from '../config';
import { db } from '../db';
import { InvitationNotFoundError, TalkNotFoundError } from '../errors';
import {
  archiveTalk,
  createTalk,
  deleteTalk,
  findTalks,
  getTalk,
  inviteCoSpeakerToTalk,
  removeCoSpeakerFromTalk,
  restoreTalk,
  updateTalk,
  validateTalkForm,
} from './talks.server';

describe('#findTalks', () => {
  afterEach(resetDB);

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
        createdAt: talk.createdAt.toUTCString(),
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
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { archived: true },
    });

    const result = await findTalks(speaker.id, { archived: true });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(talk.id);
  });
});

describe('#getTalk', () => {
  afterEach(resetDB);

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

    expect(result.proposals).toEqual([
      {
        date: proposal.updatedAt.toUTCString(),
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

describe('#deleteTalk', () => {
  afterEach(resetDB);

  it('deletes a speaker talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await deleteTalk(speaker.id, talk.id);

    const count = await db.talk.count({ where: { id: talk.id } });
    expect(count).toBe(0);
  });

  it('deletes a speaker talk and talk proposals still in draft', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const event1 = await eventFactory();
    await proposalFactory({ event: event1, talk, traits: ['draft'] });
    const event2 = await eventFactory();
    await proposalFactory({ event: event2, talk, traits: ['submitted'] });

    await deleteTalk(speaker.id, talk.id);

    const countTalk = await db.talk.count();
    const countProposal = await db.proposal.count();
    expect(countTalk).toBe(0);
    expect(countProposal).toBe(1);
  });

  it('throws an error when talk does not belong to the speaker', async () => {
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });

    await expect(deleteTalk(speaker.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(deleteTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#createTalk', () => {
  afterEach(resetDB);

  it('creates a speaker talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await updateTalk(speaker.id, talk.id, {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    });

    const actual = await db.talk.findUnique({
      where: { id: talk.id },
      include: { speakers: true },
    });

    expect(talk).not.toBeNull();
    expect(actual?.title).toBe('Talk title');
    expect(actual?.abstract).toBe('Talk abstract');
    expect(actual?.references).toBe('Talk references');
    expect(actual?.languages).toEqual(['fr']);
    expect(actual?.level).toEqual(TalkLevel.ADVANCED);
  });
});

describe('#updateTalk', () => {
  afterEach(resetDB);

  it('updates a speaker talk', async () => {
    const speaker = await userFactory();

    const talkId = await createTalk(speaker.id, {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    });

    const talk = await db.talk.findUnique({
      where: { id: talkId },
      include: { speakers: true },
    });

    expect(talk?.title).toBe('Talk title');
    expect(talk?.abstract).toBe('Talk abstract');
    expect(talk?.references).toBe('Talk references');
    expect(talk?.languages).toEqual(['fr']);
    expect(talk?.level).toEqual(TalkLevel.ADVANCED);
    expect(talk?.speakers[0].id).toBe(speaker.id);
  });

  it('throws an error when talk does not belong to the speaker', async () => {
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const updateData = {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    };
    await expect(updateTalk(speaker.id, talk.id, updateData)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    const updateData = {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    };
    await expect(updateTalk(speaker.id, 'XXX', updateData)).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#validateTalkForm', () => {
  it('validates talk form data', () => {
    const formData = new FormData();
    formData.append('title', 'Hello world');
    formData.append('abstract', 'Welcome to the world!');
    formData.append('references', 'This is my world.');
    formData.append('languages[0]', 'en');
    formData.append('languages[1]', 'fr');
    formData.append('level', 'ADVANCED');

    const result = validateTalkForm(formData);
    expect(result.success && result.data).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: TalkLevel.ADVANCED,
    });
  });

  it('validates mandatory and format for personal information', () => {
    const formData = new FormData();
    formData.append('title', '');
    formData.append('abstract', '');
    formData.append('level', 'BAD_VALUE');

    const result = validateTalkForm(formData);
    expect(!result.success && result.error.errors.map((e) => e.code)).toEqual([
      'too_small',
      'too_small',
      'invalid_enum_value',
    ]);
  });
});

describe('#inviteCoSpeakerToTalk', () => {
  afterEach(resetDB);

  it('adds a cospeaker to the talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const invite = await inviteFactory({ talk });
    const cospeaker = await userFactory();

    const { id } = await inviteCoSpeakerToTalk(invite?.id!, cospeaker.id);

    const result = await db.talk.findUnique({
      where: { id },
      include: { speakers: true },
    });

    const speakers = result?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(2);
    expect(speakers).toContain(speaker.id);
    expect(speakers).toContain(cospeaker.id);
  });

  it('throws an error when invitation not found', async () => {
    const speaker = await userFactory();
    await expect(inviteCoSpeakerToTalk('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#removeCoSpeakerFromTalk', () => {
  afterEach(resetDB);

  it('adds a cospeaker to the talk', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });

    await removeCoSpeakerFromTalk(speaker.id, talk.id, cospeaker.id);

    const talkUpdated = await db.talk.findUnique({
      where: { id: talk.id },
      include: { speakers: true },
    });

    const speakers = talkUpdated?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(1);
    expect(speakers).toContain(speaker.id);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });

    const updater = await userFactory();
    await expect(removeCoSpeakerFromTalk(updater.id, talk.id, cospeaker.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromTalk(speaker.id, 'XXX', cospeaker.id)).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#archiveTalk', () => {
  afterEach(resetDB);

  it('archives a talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await archiveTalk(speaker.id, talk.id);

    const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
    expect(talkUpdated?.archived).toBe(true);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const updater = await userFactory();

    await expect(archiveTalk(updater.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(archiveTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#restoreTalk', () => {
  afterEach(resetDB);

  it('restores a archived talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { archived: true },
    });

    await restoreTalk(speaker.id, talk.id);

    const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
    expect(talkUpdated?.archived).toBe(false);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { archived: true },
    });
    const updater = await userFactory();

    await expect(restoreTalk(updater.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(restoreTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
