import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { SpeakerProposals } from './SpeakerProposals';

describe('SpeakerProposals', () => {
  describe('#count', () => {
    it('returns count submitted proposals', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();

      // talk submitted (counted)
      const talk1 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk1 });
      // talk submitted as draft (not counted)
      const talk2 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk2, traits: ['draft'] });

      const proposalsCount = await SpeakerProposals.for(speaker.id, event.slug).count();

      expect(proposalsCount).toEqual(1);
    });
  });

  describe('#drafts', () => {
    it('returns drafts proposals which can be submitted', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();

      // not submitted talk (expected)
      const talk1 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk1 });
      // talk submitted as draft (expected)
      const talk2 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk2, traits: ['draft'] });

      const result = await SpeakerProposals.for(speaker.id, event.slug).drafts();

      expect(result).toEqual([
        {
          id: talk2.id,
          title: talk2.title,
          speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
        },
      ]);
    });
  });
});
