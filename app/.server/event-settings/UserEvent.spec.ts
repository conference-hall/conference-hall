import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from 'prisma/db.server';
import { EventNotFoundError, ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server';

import { UserEvent } from './UserEvent';

describe('UserEvent', () => {
  describe('#allowedFor', () => {
    it('returns the event if user has access to the event', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team });

      const result = await UserEvent.for(user.id, team.slug, event.slug).allowedFor(['OWNER']);
      expect(result.id).toEqual(event.id);
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team });
      await expect(UserEvent.for(user.id, team.slug, event.slug).allowedFor(['MEMBER'])).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user role is not part of the team event', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });
      await expect(UserEvent.for(user.id, team.slug, event.slug).allowedFor(['OWNER'])).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if event is not part of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });
      await expect(UserEvent.for(user.id, team.slug, event.slug).allowedFor(['OWNER'])).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if event does not exist', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      await expect(UserEvent.for(user.id, team.slug, 'XXX').allowedFor(['OWNER'])).rejects.toThrowError(
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
        traits: ['conference-cfp-open'],
        team,
      });

      const result = await UserEvent.for(user.id, team.slug, event.slug).get();

      expect(result).toEqual({
        id: event.id,
        name: event.name,
        slug: event.slug,
        type: event.type,
        address: event.address,
        conferenceStart: event.conferenceStart?.toUTCString(),
        conferenceEnd: event.conferenceEnd?.toUTCString(),
        description: event.description,
        visibility: event.visibility,
        websiteUrl: event.websiteUrl,
        codeOfConductUrl: event.codeOfConductUrl,
        contactEmail: event.contactEmail,
        logo: event.logo,
        maxProposals: event.maxProposals,
        surveyEnabled: event.surveyEnabled,
        surveyQuestions: [],
        reviewEnabled: event.reviewEnabled,
        displayProposalsReviews: event.displayProposalsReviews,
        displayProposalsSpeakers: event.displayProposalsSpeakers,
        formatsRequired: event.formatsRequired,
        categoriesRequired: event.categoriesRequired,
        emailOrganizer: event.emailOrganizer,
        emailNotifications: [],
        slackWebhookUrl: event.slackWebhookUrl,
        apiKey: event.apiKey,
        cfpStart: event.cfpStart?.toUTCString(),
        cfpEnd: event.cfpEnd?.toUTCString(),
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
    let owner: User, reviewer: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
      event = await eventFactory({ team });
    });

    it('creates a new event into the team', async () => {
      const created = await UserEvent.for(owner.id, team.slug, event.slug).update({
        name: 'Updated',
        slug: 'updated',
        visibility: 'PUBLIC',
        address: 'Address',
        description: 'Updated',
        categoriesRequired: true,
        formatsRequired: true,
        codeOfConductUrl: 'codeOfConductUrl',
        emailNotifications: ['submitted'],
        logo: 'logo',
        apiKey: 'apiKey',
      });

      expect(created.slug).toBe('updated');

      const updated = await db.event.findUnique({ where: { slug: created.slug } });
      expect(updated?.name).toBe('Updated');
      expect(updated?.slug).toBe('updated');
      expect(updated?.visibility).toBe('PUBLIC');
      expect(updated?.address).toBe('Address');
      expect(updated?.categoriesRequired).toBe(true);
      expect(updated?.formatsRequired).toBe(true);
      expect(updated?.description).toBe('Updated');
      expect(updated?.logo).toBe('logo');
      expect(updated?.codeOfConductUrl).toBe('codeOfConductUrl');
      expect(updated?.emailNotifications).toEqual(['submitted']);
      expect(updated?.apiKey).toBe('apiKey');
    });

    it.todo('test address geocoding');

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