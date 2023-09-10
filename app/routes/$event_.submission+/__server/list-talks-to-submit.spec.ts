import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { describe, expect, it } from 'vitest';

import { EventNotFoundError } from '~/libs/errors';

import { listTalksToSubmit } from './list-talks-to-submit.server';

describe('#listTalksToSubmit', () => {
  it('returns drafts and talks from library which can be submitted', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();

    // other speaker talk (not returned)
    await talkFactory({ speakers: [otherSpeaker] });
    // archived talk (not returned)
    await talkFactory({ speakers: [speaker], traits: ['archived'] });
    // talk submitted (not returned)
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1 });
    // not submitted talk (expected)
    const talk2 = await talkFactory({ speakers: [speaker] });
    // talk submitted as draft (expected)
    const talk3 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk3, traits: ['draft'] });

    const result = await listTalksToSubmit(speaker.id, event.slug);

    expect(result).toEqual({
      proposalsCount: 1,
      drafts: [
        {
          id: talk3.id,
          title: talk3.title,
          speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
        },
      ],
      talks: [
        {
          id: talk2.id,
          title: talk2.title,
          speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
        },
      ],
    });
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    await expect(listTalksToSubmit(speaker.id, 'XXX')).rejects.toThrowError(EventNotFoundError);
  });
});
