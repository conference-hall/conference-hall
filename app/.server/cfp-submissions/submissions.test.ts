import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';

import { Submissions } from './submissions.ts';

describe('Submissions', () => {
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

      const proposalsCount = await Submissions.for(speaker.id, event.slug).count();

      expect(proposalsCount).toEqual(1);
    });
  });

  describe('#list', () => {
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

      const results = await Submissions.for(speaker.id, event.slug).list();

      expect(results).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          talkId: proposal.talkId,
          status: SpeakerProposalStatus.Submitted,
          createdAt: proposal.createdAt,
          speakers: [
            {
              name: speaker.name,
              picture: speaker.picture,
            },
          ],
        },
      ]);
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

      const result = await Submissions.for(speaker.id, event.slug).drafts();

      expect(result).toEqual([
        {
          id: talk2.id,
          title: talk2.title,
          speakers: [{ name: speaker.name, picture: speaker.picture }],
        },
      ]);
    });
  });
});
