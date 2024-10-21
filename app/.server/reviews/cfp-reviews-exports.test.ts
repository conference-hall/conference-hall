import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.server.ts';

import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { CfpReviewsExports } from './cfp-reviews-exports.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';

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
    it('triggers job to export sessions and speakers to OpenPlanner', async () => {
      const exports = CfpReviewsExports.for(owner.id, team.slug, event.slug);

      await exports.forOpenPlanner({});

      expect(exportToOpenPlanner.trigger).toHaveBeenCalledWith({
        userId: owner.id,
        teamSlug: team.slug,
        eventSlug: event.slug,
        filters: {},
      });
    });

    it('throws an error if user is not owner', async () => {
      const exports = CfpReviewsExports.for(member.id, team.slug, event.slug);

      await expect(exports.forOpenPlanner({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
