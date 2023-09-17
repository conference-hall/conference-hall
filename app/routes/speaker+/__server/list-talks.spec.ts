import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { listTalks } from './list-talks.server.ts';

describe('#listTalks', () => {
  it('returns speaker talks list', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await talkFactory({ speakers: [speaker], attributes: { archived: true } });

    const otherSpeaker = await userFactory();
    await talkFactory({ speakers: [otherSpeaker] });

    const result = await listTalks(speaker.id);

    expect(result).toEqual([
      {
        id: talk.id,
        title: talk.title,
        archived: false,
        createdAt: talk.createdAt.toUTCString(),
        speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
      },
    ]);
  });

  it('returns talks when co-speaker', async () => {
    const owner = await userFactory();
    await talkFactory({ speakers: [owner] });

    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [owner, cospeaker] });

    const result = await listTalks(cospeaker.id);

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

    const result = await listTalks(speaker.id, { archived: true });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(talk.id);
  });
});
