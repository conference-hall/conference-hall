import type { Event, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventIntegrationFactory } from 'tests/factories/integrations.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { EventSettings } from './event-settings.server.ts';

describe('EventSettings', () => {
  describe('#update', () => {
    let owner: User;
    let reviewer: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
      event = await eventFactory({ team });
    });

    it('updates an event', async () => {
      const created = await EventSettings.for(owner.id, team.slug, event.slug).update({
        name: 'Updated',
        slug: 'updated',
        visibility: 'PUBLIC',
        timezone: 'Europe/Oslo',
        location: 'Location',
        description: 'Updated',
        categoriesRequired: true,
        formatsRequired: true,
        codeOfConductUrl: 'codeOfConductUrl',
        emailNotifications: ['submitted'],
        logoUrl: 'logoUrl',
        apiKey: 'apiKey',
      });

      expect(created.slug).toBe('updated');

      const updated = await db.event.findUnique({ where: { slug: created.slug } });
      expect(updated?.name).toBe('Updated');
      expect(updated?.slug).toBe('updated');
      expect(updated?.visibility).toBe('PUBLIC');
      expect(updated?.timezone).toBe('Europe/Oslo');
      expect(updated?.location).toBe('Location');
      expect(updated?.categoriesRequired).toBe(true);
      expect(updated?.formatsRequired).toBe(true);
      expect(updated?.description).toBe('Updated');
      expect(updated?.logoUrl).toBe('logoUrl');
      expect(updated?.codeOfConductUrl).toBe('codeOfConductUrl');
      expect(updated?.emailNotifications).toEqual(['submitted']);
      expect(updated?.apiKey).toBe('apiKey');
    });

    it.todo('test location geocoding');

    it('throws an error if user is not owner', async () => {
      await expect(
        EventSettings.for(reviewer.id, team.slug, event.slug).update({ name: 'Hello world' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(
        EventSettings.for(user.id, team.slug, event.slug).update({ name: 'Hello world' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#delete', () => {
    let owner: User;
    let member: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      owner = await userFactory();
      member = await userFactory();
      team = await teamFactory({ owners: [owner], members: [member] });
      event = await eventFactory({ team });
    });

    it('deletes an event and its relations', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const tag = await eventProposalTagFactory({ event });
      const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category], tags: [tag] });
      const comment = await commentFactory({ proposal, user: member });
      const review = await reviewFactory({ proposal, user: member });
      const survey = await surveyFactory({ event, user: speaker });
      const schedule = await scheduleFactory({ event });
      const integration = await eventIntegrationFactory({ event });

      await EventSettings.for(owner.id, team.slug, event.slug).delete();

      const deletedEvent = await db.event.findUnique({ where: { id: event.id } });
      expect(deletedEvent).toBeNull();

      const deletedProposal = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(deletedProposal).toBeNull();

      const deletedComment = await db.comment.findUnique({ where: { id: comment.id } });
      expect(deletedComment).toBeNull();

      const deletedReview = await db.review.findUnique({ where: { id: review.id } });
      expect(deletedReview).toBeNull();

      const deletedTag = await db.eventProposalTag.findUnique({ where: { id: tag.id } });
      expect(deletedTag).toBeNull();

      const deletedFormat = await db.eventFormat.findUnique({ where: { id: format.id } });
      expect(deletedFormat).toBeNull();

      const deletedCategory = await db.eventCategory.findUnique({ where: { id: category.id } });
      expect(deletedCategory).toBeNull();

      const deletedSurvey = await db.survey.findUnique({ where: { id: survey.id } });
      expect(deletedSurvey).toBeNull();

      const deletedSchedule = await db.schedule.findUnique({ where: { id: schedule.id } });
      expect(deletedSchedule).toBeNull();

      const deletedIntegration = await db.eventIntegrationConfig.findUnique({ where: { id: integration.id } });
      expect(deletedIntegration).toBeNull();
    });

    it('throws an error if user is not owner', async () => {
      await expect(EventSettings.for(member.id, team.slug, event.slug).delete()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(EventSettings.for(user.id, team.slug, event.slug).delete()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#buildGeneralSettingsSchema', () => {
    let owner: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      owner = await userFactory();
      team = await teamFactory({ owners: [owner] });
      event = await eventFactory({ team });
    });

    it('validates when slug is the same as the original', async () => {
      const schema = await EventSettings.for(owner.id, team.slug, event.slug).buildGeneralSettingsSchema();

      const result = await schema.safeParseAsync({
        name: 'Hello',
        visibility: 'PUBLIC',
        slug: event.slug,
        timezone: 'Europe/Paris',
      });

      expect(result.success).toBe(true);
    });

    it('returns an error when slug already exists', async () => {
      await eventFactory({ attributes: { slug: 'hello-world' } });

      const schema = await EventSettings.for(owner.id, team.slug, event.slug).buildGeneralSettingsSchema();

      const result = await schema.safeParseAsync({
        name: 'Hello',
        visibility: 'PUBLIC',
        slug: 'hello-world',
        timezone: 'Europe/Paris',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.slug).toEqual(['This URL already exists.']);
      }
    });
  });
});
