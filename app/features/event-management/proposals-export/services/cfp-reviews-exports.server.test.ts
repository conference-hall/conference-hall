import type { Event, EventCategory, EventFormat, EventProposalTag, Team, User } from 'prisma/generated/client.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { CfpReviewsExports } from './cfp-reviews-exports.server.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';

describe('CfpReviewsExports', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let tag: EventProposalTag;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team, traits: ['withIntegration'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    tag = await eventProposalTagFactory({ event });
  });

  describe('#forJson', () => {
    it('export reviews to json', async () => {
      const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });
      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        tags: [tag],
        talk: await talkFactory({ speakers: [speaker] }),
      });

      const result = await CfpReviewsExports.for(owner.id, team.slug, event.slug).forJson({});

      expect(result).toEqual([
        {
          id: proposal.id,
          proposalNumber: proposal.proposalNumber,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          abstract: proposal.abstract,
          languages: proposal.languages,
          references: proposal.references,
          level: proposal.level,
          formats: [{ id: format.id, name: format.name, description: format.description }],
          categories: [{ id: category.id, name: category.name, description: category.description }],
          tags: [tag.name],
          review: { negatives: 0, positives: 0, average: null },
          speakers: [
            {
              id: eventSpeaker.id,
              name: eventSpeaker.name,
              email: eventSpeaker.email,
              bio: eventSpeaker.bio,
              picture: eventSpeaker.picture,
              company: eventSpeaker.company,
              location: eventSpeaker.location,
              references: eventSpeaker.references,
              socialLinks: eventSpeaker.socialLinks,
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
          proposalNumber: proposal.proposalNumber,
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
