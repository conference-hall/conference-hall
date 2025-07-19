import type { Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { EventCreateSchema, EventCreation } from './event-creation.server.ts';

describe('EventCreation', () => {
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
      const created = await EventCreation.for(owner.id, team.slug).create({
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
      await expect(
        EventCreation.for(reviewer.id, team.slug).create({
          type: 'CONFERENCE',
          name: 'Hello world',
          slug: 'hello-world',
          visibility: 'PUBLIC',
          timezone: 'Europe/Paris',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(
        EventCreation.for(user.id, team.slug).create({
          type: 'CONFERENCE',
          name: 'Hello world',
          slug: 'hello-world',
          visibility: 'PUBLIC',
          timezone: 'Europe/Paris',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
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

    it('returns validation errors', async () => {
      const result = await EventCreateSchema.safeParseAsync({
        type: 'toto',
        name: '',
        visibility: 'toto',
        slug: '!@#',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error!);
        expect(fieldErrors.name).toEqual(['Too small: expected string to have >=3 characters']);
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
        expect(fieldErrors.type).toEqual(['Invalid option: expected one of "CONFERENCE"|"MEETUP"']);
        expect(fieldErrors.visibility).toEqual(['Invalid option: expected one of "PUBLIC"|"PRIVATE"']);
      }
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
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error!);
        expect(fieldErrors.slug).toEqual(['This URL already exists.']);
      }
    });
  });
});
