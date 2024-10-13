import type { Event, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { EventNotFoundError, ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';

import { UserEvent } from './user-event.ts';

describe('UserEvent', () => {
  describe('#needsPermission', () => {
    it('returns the event if user is allowed for the given permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team });

      const result = await UserEvent.for(user.id, team.slug, event.slug).needsPermission('canEditEvent');
      expect(result.id).toEqual(event.id);
    });

    it('throws an error if user role is not allowed for the permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ reviewers: [user] });
      const event = await eventFactory({ team });
      await expect(UserEvent.for(user.id, team.slug, event.slug).needsPermission('canEditEvent')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user role is not part of the team event', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });
      await expect(UserEvent.for(user.id, team.slug, event.slug).needsPermission('canEditEvent')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if event is not part of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });
      await expect(UserEvent.for(user.id, team.slug, event.slug).needsPermission('canEditEvent')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if event does not exist', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      await expect(UserEvent.for(user.id, team.slug, 'XXX').needsPermission('canEditEvent')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#get', () => {
    it('returns the event for organizer', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({
        attributes: {
          name: 'Awesome event',
          slug: 'event',
          visibility: 'PUBLIC',
        },
        traits: ['conference-cfp-open', 'withIntegration'],
        team,
      });

      const result = await UserEvent.for(user.id, team.slug, event.slug).get();

      expect(result).toEqual({
        id: event.id,
        name: event.name,
        slug: event.slug,
        type: event.type,
        location: event.location,
        onlineEvent: event.onlineEvent,
        timezone: event.timezone,
        conferenceStart: event.conferenceStart?.toISOString(),
        conferenceEnd: event.conferenceEnd?.toISOString(),
        description: event.description,
        visibility: event.visibility,
        websiteUrl: event.websiteUrl,
        codeOfConductUrl: event.codeOfConductUrl,
        contactEmail: event.contactEmail,
        logoUrl: event.logoUrl,
        maxProposals: event.maxProposals,
        surveyEnabled: event.surveyEnabled,
        surveyQuestions: [],
        reviewEnabled: event.reviewEnabled,
        displayProposalsReviews: event.displayProposalsReviews,
        displayProposalsSpeakers: event.displayProposalsSpeakers,
        formatsRequired: event.formatsRequired,
        formatsAllowMultiple: event.formatsAllowMultiple,
        categoriesRequired: event.categoriesRequired,
        categoriesAllowMultiple: event.categoriesAllowMultiple,
        emailOrganizer: event.emailOrganizer,
        emailNotifications: [],
        slackWebhookUrl: event.slackWebhookUrl,
        apiKey: event.apiKey,
        integrations: ['OPEN_PLANNER'],
        cfpStart: event.cfpStart?.toISOString(),
        cfpEnd: event.cfpEnd?.toISOString(),
        cfpState: 'OPENED',
        formats: [],
        categories: [],
        archived: false,
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });
      await expect(UserEvent.for(user.id, team.slug, event.slug).get()).rejects.toThrowError(EventNotFoundError);
    });

    it('throws an error if event does not belong to team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });
      await expect(UserEvent.for(user.id, team.slug, event.slug).get()).rejects.toThrowError(EventNotFoundError);
    });
  });

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
      const created = await UserEvent.for(owner.id, team.slug, event.slug).update({
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

    it('returns an error message when slug already exists', async () => {
      await eventFactory({ team, attributes: { slug: 'hello-world' } });

      await expect(UserEvent.for(owner.id, team.slug, event.slug).update({ slug: 'hello-world' })).rejects.toThrowError(
        SlugAlreadyExistsError,
      );
    });

    it('throws an error if user is not owner', async () => {
      await expect(
        UserEvent.for(reviewer.id, team.slug, event.slug).update({ name: 'Hello world' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(UserEvent.for(user.id, team.slug, event.slug).update({ name: 'Hello world' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
