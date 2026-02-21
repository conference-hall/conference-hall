import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Team, User } from '../../../../../prisma/generated/client.ts';
import { EventCreateSchema, EventCreation } from './event-creation.server.ts';

describe('EventCreation', () => {
  describe('findTemplateEvents', () => {
    let owner: User;
    let team: Team;

    beforeEach(async () => {
      owner = await userFactory();
      team = await teamFactory({ owners: [owner] });
    });

    it('returns existing events of same type', async () => {
      await eventFactory({ team, creator: owner, attributes: { type: 'CONFERENCE', name: 'Conference 1' } });
      await eventFactory({ team, creator: owner, attributes: { type: 'CONFERENCE', name: 'Conference 2' } });
      await eventFactory({ team, creator: owner, attributes: { type: 'MEETUP', name: 'Meetup 1' } });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const events = await EventCreation.for(authorizedTeam).findTemplateEvents('CONFERENCE');

      expect(events).toHaveLength(2);
      expect(events[0]?.name).toBe('Conference 2');
      expect(events[1]?.name).toBe('Conference 1');
    });

    it('excludes archived events', async () => {
      await eventFactory({ team, creator: owner, attributes: { type: 'CONFERENCE', name: 'Active' } });
      await eventFactory({
        team,
        creator: owner,
        attributes: { type: 'CONFERENCE', name: 'Archived', archived: true },
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const events = await EventCreation.for(authorizedTeam).findTemplateEvents('CONFERENCE');

      expect(events).toHaveLength(1);
      expect(events[0]?.name).toBe('Active');
    });

    it('returns events ordered by creation date descending', async () => {
      const event1 = await eventFactory({ team, creator: owner, attributes: { type: 'CONFERENCE', name: 'First' } });
      await db.event.update({ where: { id: event1.id }, data: { createdAt: new Date('2023-01-01') } });

      const event2 = await eventFactory({ team, creator: owner, attributes: { type: 'CONFERENCE', name: 'Second' } });
      await db.event.update({ where: { id: event2.id }, data: { createdAt: new Date('2023-06-01') } });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const events = await EventCreation.for(authorizedTeam).findTemplateEvents('CONFERENCE');

      expect(events[0]?.name).toBe('Second');
      expect(events[1]?.name).toBe('First');
    });

    it('returns empty array when no events exist', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const events = await EventCreation.for(authorizedTeam).findTemplateEvents('CONFERENCE');

      expect(events).toEqual([]);
    });

    it('throws error if user is not team owner', async () => {
      const reviewer = await userFactory();
      const teamWithReviewer = await teamFactory({ owners: [owner], reviewers: [reviewer] });

      const authorizedTeam = await getAuthorizedTeam(reviewer.id, teamWithReviewer.slug);
      await expect(EventCreation.for(authorizedTeam).findTemplateEvents('CONFERENCE')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('create', () => {
    let owner: User;
    let reviewer: User;
    let team: Team;

    beforeEach(async () => {
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    });

    it('creates a new event into the team', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const created = await EventCreation.for(authorizedTeam).create({
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
      });

      expect(created.slug).toBe('hello-world');

      const event = await db.event.findUnique({ where: { slug: created.slug } });
      expect(event?.type).toBe('CONFERENCE');
      expect(event?.name).toBe('Hello world');
      expect(event?.slug).toBe('hello-world');
      expect(event?.visibility).toBe('PUBLIC');
      expect(event?.teamId).toBe(team.id);
      expect(event?.creatorId).toBe(owner.id);
    });

    it('throws an error if user is not owner', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      await expect(
        EventCreation.for(authorizedTeam).create({
          type: 'CONFERENCE',
          name: 'Hello world',
          slug: 'hello-world',
          visibility: 'PUBLIC',
          timezone: 'Europe/Paris',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('creates event with template settings', async () => {
      const template = await eventFactory({
        team,
        creator: owner,
        attributes: {
          type: 'CONFERENCE',
          description: 'Template description',
          websiteUrl: 'https://template.com',
          contactEmail: 'template@example.com',
          location: 'Template City',
          onlineEvent: true,
          maxProposals: 5,
          displayProposalsReviews: true,
          displayProposalsSpeakers: false,
          speakersConversationEnabled: true,
          formatsRequired: true,
          formatsAllowMultiple: true,
          categoriesRequired: false,
          categoriesAllowMultiple: true,
          formats: {
            create: [
              { name: 'Talk', description: 'Standard talk', order: 1 },
              { name: 'Workshop', description: 'Hands-on workshop', order: 2 },
            ],
          },
          categories: {
            create: [
              { name: 'Frontend', description: 'Frontend technologies', order: 1 },
              { name: 'Backend', description: 'Backend technologies', order: 2 },
            ],
          },
          proposalTags: {
            create: [
              { name: 'Beginner', color: 'green' },
              { name: 'Advanced', color: 'red' },
            ],
          },
          emailCustomizations: {
            create: [{ template: 'ACCEPTED', locale: 'en', subject: 'Congrats!', content: 'You are accepted' }],
          },
        },
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const created = await EventCreation.for(authorizedTeam).create({
        type: 'CONFERENCE',
        name: 'New Event',
        slug: 'new-event',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
        eventTemplateId: template.id,
      });

      const event = await db.event.findUnique({
        where: { slug: created.slug },
        include: { formats: true, categories: true, proposalTags: true, emailCustomizations: true },
      });

      expect(event?.description).toBe('Template description');
      expect(event?.websiteUrl).toBe('https://template.com');
      expect(event?.contactEmail).toBe('template@example.com');
      expect(event?.location).toBe('Template City');
      expect(event?.onlineEvent).toBe(true);
      expect(event?.maxProposals).toBe(5);
      expect(event?.displayProposalsReviews).toBe(true);
      expect(event?.displayProposalsSpeakers).toBe(false);
      expect(event?.speakersConversationEnabled).toBe(true);
      expect(event?.formatsRequired).toBe(true);
      expect(event?.formatsAllowMultiple).toBe(true);
      expect(event?.categoriesRequired).toBe(false);
      expect(event?.categoriesAllowMultiple).toBe(true);

      expect(event?.formats).toHaveLength(2);
      expect(event?.formats[0]?.name).toBe('Talk');
      expect(event?.formats[1]?.name).toBe('Workshop');

      expect(event?.categories).toHaveLength(2);
      expect(event?.categories[0]?.name).toBe('Frontend');
      expect(event?.categories[1]?.name).toBe('Backend');

      expect(event?.proposalTags).toHaveLength(2);
      expect(event?.proposalTags.find((tag) => tag.name === 'Beginner')).toBeDefined();
      expect(event?.proposalTags.find((tag) => tag.name === 'Advanced')).toBeDefined();

      expect(event?.emailCustomizations).toHaveLength(1);
      expect(event?.emailCustomizations[0]?.subject).toBe('Congrats!');
    });

    it('overrides template settings with provided data', async () => {
      const template = await eventFactory({
        team,
        creator: owner,
        attributes: {
          type: 'CONFERENCE',
          description: 'Template description',
          websiteUrl: 'https://template.com',
        },
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const created = await EventCreation.for(authorizedTeam).create({
        type: 'CONFERENCE',
        name: 'New Event',
        slug: 'new-event',
        visibility: 'PRIVATE',
        timezone: 'America/New_York',
        eventTemplateId: template.id,
      });

      const event = await db.event.findUnique({ where: { slug: created.slug } });

      expect(event?.name).toBe('New Event');
      expect(event?.slug).toBe('new-event');
      expect(event?.visibility).toBe('PRIVATE');
      expect(event?.timezone).toBe('America/New_York');
      expect(event?.description).toBe('Template description');
      expect(event?.websiteUrl).toBe('https://template.com');
    });

    it('does not copy template from different team', async () => {
      const otherTeam = await teamFactory({ owners: [owner] });
      const template = await eventFactory({
        team: otherTeam,
        creator: owner,
        attributes: {
          type: 'CONFERENCE',
          description: 'Other team template',
        },
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const created = await EventCreation.for(authorizedTeam).create({
        type: 'CONFERENCE',
        name: 'New Event',
        slug: 'new-event',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
        eventTemplateId: template.id,
      });

      const event = await db.event.findUnique({ where: { slug: created.slug } });
      expect(event?.description).toBeNull();
    });

    it('does not copy template when template does not exist', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const created = await EventCreation.for(authorizedTeam).create({
        type: 'CONFERENCE',
        name: 'New Event',
        slug: 'new-event',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
        eventTemplateId: 'non-existent-id',
      });

      const event = await db.event.findUnique({ where: { slug: created.slug } });
      expect(event?.description).toBeNull();
    });
  });

  describe('Validate EventCreateSchema', () => {
    it('validates valid inputs', async () => {
      const result = await EventCreateSchema.safeParseAsync({
        type: 'CONFERENCE',
        name: 'Event name',
        visibility: 'PUBLIC',
        slug: 'event-name',
        timezone: 'Europe/Paris',
      });

      expect(result.success && result.data).toEqual({
        name: 'Event name',
        slug: 'event-name',
        type: 'CONFERENCE',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
      });
    });

    it('validates inputs with eventTemplateId', async () => {
      const result = await EventCreateSchema.safeParseAsync({
        type: 'CONFERENCE',
        name: 'Event name',
        visibility: 'PUBLIC',
        slug: 'event-name',
        timezone: 'Europe/Paris',
        eventTemplateId: 'template-id-123',
      });

      expect(result.success && result.data).toEqual({
        name: 'Event name',
        slug: 'event-name',
        type: 'CONFERENCE',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
        eventTemplateId: 'template-id-123',
      });
    });

    it('returns validation errors', async () => {
      const result = await EventCreateSchema.safeParseAsync({
        type: 'toto',
        name: '',
        visibility: 'toto',
        slug: '!@#',
      });

      expect(result.success).toBe(false);
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.name).toEqual(['Too small: expected string to have >=3 characters']);
      expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
      expect(fieldErrors.type).toEqual(['Invalid option: expected one of "CONFERENCE"|"MEETUP"']);
      expect(fieldErrors.visibility).toEqual(['Invalid option: expected one of "PUBLIC"|"PRIVATE"']);
    });

    it('returns an error when slug already exists', async () => {
      await eventFactory({ attributes: { slug: 'hello-world' } });

      const result = await EventCreateSchema.safeParseAsync({
        type: 'CONFERENCE',
        name: 'Hello',
        visibility: 'PUBLIC',
        slug: 'hello-world',
      });

      expect(result.success).toBe(false);
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.slug).toEqual(['This URL already exists.']);
    });
  });
});
