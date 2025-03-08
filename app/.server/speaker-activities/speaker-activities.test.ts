import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import type { Event, Proposal, Team, User } from '@prisma/client';
import { SpeakerActivities } from './speaker-activities.ts';

describe('SpeakerActivities', () => {
  describe('list', () => {
    let team: Team;
    let speaker: User;
    let event: Event;
    let event2: Event;
    let proposal: Proposal;
    let proposalEvent2: Proposal;

    beforeEach(async () => {
      team = await teamFactory();
      event = await eventFactory({ traits: ['conference-cfp-open'], team });
      event2 = await eventFactory({ team });

      speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const archivedTalk = await talkFactory({ speakers: [speaker], traits: ['archived'] });

      await proposalFactory({ event, talk: archivedTalk });
      proposal = await proposalFactory({ event, talk });
      proposalEvent2 = await proposalFactory({ event: event2, talk: talk });
    });

    it('returns speaker activity with proposal submitted ordered by update date', async () => {
      const result = await SpeakerActivities.for(speaker.id).list();

      expect(result).toEqual({
        activities: [
          {
            slug: event2.slug,
            name: event2.name,
            teamName: team.name,
            logoUrl: event2.logoUrl,
            cfpState: 'CLOSED',
            submissions: [
              {
                id: proposalEvent2.id,
                title: proposalEvent2.title,
                status: SpeakerProposalStatus.DeliberationPending,
                speakers: [{ name: speaker.name, picture: speaker.picture }],
              },
            ],
          },
          {
            slug: event.slug,
            name: event.name,
            teamName: team.name,
            logoUrl: event.logoUrl,
            cfpState: 'OPENED',
            submissions: [
              {
                id: proposal.id,
                title: proposal.title,
                status: SpeakerProposalStatus.Submitted,
                speakers: [{ name: speaker.name, picture: speaker.picture }],
              },
            ],
          },
        ],
        hasNextPage: false,
        nextPage: 2,
      });
    });

    it('returns the next events page', async () => {
      const pageSize = 1;

      const resultPage1 = await SpeakerActivities.for(speaker.id).list(1, pageSize);

      expect(resultPage1.hasNextPage).toBe(true);
      expect(resultPage1.nextPage).toBe(2);
      expect(resultPage1.activities.length).toBe(1);
      expect(resultPage1.activities[0].slug).toBe(event2.slug);

      const resultPage2 = await SpeakerActivities.for(speaker.id).list(2, pageSize);

      expect(resultPage2.hasNextPage).toBe(false);
      expect(resultPage2.activities.length).toBe(2);
      expect(resultPage2.activities[0].slug).toBe(event2.slug);
      expect(resultPage2.activities[1].slug).toBe(event.slug);
    });
  });
});
