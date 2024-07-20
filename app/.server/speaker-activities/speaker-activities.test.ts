import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { SpeakerActivities } from './speaker-activities.ts';

describe('SpeakerActivities', () => {
  describe('list', () => {
    it('returns speaker activity with proposal submitted ordered by update date', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const event2 = await eventFactory();

      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const proposal2 = await proposalFactory({ event: event2, talk: talk });

      const result = await SpeakerActivities.for(speaker.id).list();

      expect(result).toEqual({
        activities: [
          {
            slug: event2.slug,
            name: event2.name,
            logoUrl: event2.logoUrl,
            cfpState: 'CLOSED',
            submissions: [
              {
                id: proposal2.id,
                title: proposal2.title,
                updatedAt: proposal2.updatedAt.toISOString(),
                status: SpeakerProposalStatus.DeliberationPending,
                speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
              },
            ],
          },
          {
            slug: event.slug,
            name: event.name,
            logoUrl: event.logoUrl,
            cfpState: 'OPENED',
            submissions: [
              {
                id: proposal.id,
                title: proposal.title,
                updatedAt: proposal.updatedAt.toISOString(),
                status: SpeakerProposalStatus.Submitted,
                speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
              },
            ],
          },
        ],
        hasNextPage: false,
        nextPage: 2,
      });
    });

    it.todo('returns the second page');
  });
});
