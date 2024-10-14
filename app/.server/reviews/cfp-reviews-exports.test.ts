import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.server.ts';

import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import type { Mock } from 'vitest';
import { OpenPlanner } from '~/libs/integrations/open-planner.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';
import { CfpReviewsExports } from './cfp-reviews-exports.ts';

vi.mock('~/libs/integrations/open-planner.ts', () => {
  return { OpenPlanner: { postSessionsAndSpeakers: vi.fn() } };
});

describe('CfpReviewsExports', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team, traits: ['withIntegration'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
  });

  describe('#forJson', () => {
    it('export reviews to json', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsExports.for(owner.id, team.slug, event.slug).forJson({});

      expect(result).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          abstract: proposal.abstract,
          languages: proposal.languages,
          references: proposal.references,
          level: proposal.level,
          categories: [],
          formats: [],
          reviews: {
            negatives: 0,
            positives: 0,
            average: null,
          },
          speakers: [
            {
              name: speaker.name,
              email: speaker.email,
              bio: speaker.bio,
              picture: speaker.picture,
              company: speaker.company,
              location: speaker.location,
              references: speaker.references,
              socials: speaker.socials,
            },
          ],
        },
      ]);
    });

    it('throws an error if user is not owner', async () => {
      const exports = await CfpReviewsExports.for(member.id, team.slug, event.slug);

      await expect(exports.forJson({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#forCards', () => {
    it('export a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsExports.for(owner.id, team.slug, event.slug).forCards({});

      expect(result).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          languages: proposal.languages,
          level: proposal.level,
          categories: [],
          formats: [],
          reviews: {
            negatives: 0,
            positives: 0,
            average: null,
          },
          speakers: [speaker.name],
        },
      ]);
    });

    it('throws an error if user is not owner', async () => {
      const exports = await CfpReviewsExports.for(member.id, team.slug, event.slug);

      await expect(exports.forCards({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#forOpenPlanner', () => {
    const postSessionsAndSpeakersMock = OpenPlanner.postSessionsAndSpeakers as Mock;

    beforeEach(() => {
      postSessionsAndSpeakersMock.mockReset();
    });

    it('exports sessions and speakers to OpenPlanner', async () => {
      const proposal1 = await proposalFactory({
        event,
        formats: [format],
        talk: await talkFactory({ speakers: [speaker] }),
      });
      const proposal2 = await proposalFactory({
        event,
        categories: [category],
        talk: await talkFactory({ speakers: [speaker] }),
      });
      const socials = speaker.socials as SocialLinks;

      postSessionsAndSpeakersMock.mockResolvedValue({ success: true });

      const exports = CfpReviewsExports.for(owner.id, team.slug, event.slug);
      const result = await exports.forOpenPlanner({});

      expect(result.success).toBe(true);
      expect(postSessionsAndSpeakersMock).toHaveBeenCalledWith('open-planner-event-id', 'open-planner-api-key', {
        sessions: [
          {
            id: proposal2.id,
            title: proposal2.title,
            abstract: proposal2.abstract,
            level: proposal2.level,
            language: 'en',
            speakerIds: [speaker.id],
            categoryId: category.id,
            categoryName: category.name,
          },
          {
            id: proposal1.id,
            title: proposal1.title,
            abstract: proposal1.abstract,
            level: proposal1.level,
            language: 'en',
            speakerIds: [speaker.id],
            formatId: format.id,
            formatName: format.name,
          },
        ],
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            bio: speaker.bio,
            company: speaker.company,
            photoUrl: speaker.picture,
            socials: [],
          },
        ],
      });
    });

    it('throws an error if no OpenPlanner configuration set', async () => {
      const event2 = await eventFactory({ team });
      const exports = CfpReviewsExports.for(owner.id, team.slug, event2.slug);

      await expect(exports.forOpenPlanner({})).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user is not owner', async () => {
      const exports = CfpReviewsExports.for(member.id, team.slug, event.slug);

      await expect(exports.forOpenPlanner({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
