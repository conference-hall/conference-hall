import type { Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';

import { EventCreateSchema, TeamEvents } from './team-events.ts';

describe('TeamEvents', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('list', () => {
    it('returns events of the team', async () => {
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event1 = await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });
      const event2 = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup'] });

      const team2 = await teamFactory({ owners: [user] });
      await eventFactory({ traits: ['conference-cfp-open'], team: team2 });

      const events = await TeamEvents.for(user.id, team.slug).list(false);

      expect(events).toEqual([
        {
          name: event1.name,
          slug: event1.slug,
          type: event1.type,
          logo: event1.logo,
          cfpStart: event1.cfpStart?.toISOString(),
          cfpEnd: event1.cfpEnd?.toISOString(),
          cfpState: 'CLOSED',
        },
        {
          name: event2.name,
          slug: event2.slug,
          type: event2.type,
          logo: event2.logo,
          cfpStart: event2.cfpStart?.toISOString(),
          cfpEnd: event2.cfpEnd?.toISOString(),
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('returns archived events of the team', async () => {
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup', 'archived'] });
      await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });

      const events = await TeamEvents.for(user.id, team.slug).list(true);

      expect(events).toEqual([
        {
          name: event.name,
          slug: event.slug,
          type: event.type,
          logo: event.logo,
          cfpStart: event.cfpStart?.toISOString(),
          cfpEnd: event.cfpEnd?.toISOString(),
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('throws an error when user not member of event team', async () => {
      const team = await teamFactory({ attributes: { slug: 'my-team' } });
      await eventFactory({ team });

      await expect(TeamEvents.for(user.id, team.slug).list(false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('create', () => {
    let owner: User, reviewer: User;
    let team: Team;

    beforeEach(async () => {
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    });

    it('creates a new event into the team', async () => {
      const created = await TeamEvents.for(owner.id, team.slug).create({
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

    it('returns an error message when slug already exists', async () => {
      await eventFactory({ team, attributes: { slug: 'hello-world' } });

      await expect(
        TeamEvents.for(owner.id, team.slug).create({
          type: 'CONFERENCE',
          name: 'Hello world',
          slug: 'hello-world',
          visibility: 'PUBLIC',
          timezone: 'Europe/Paris',
        }),
      ).rejects.toThrowError(SlugAlreadyExistsError);
    });

    it('throws an error if user is not owner', async () => {
      await expect(
        TeamEvents.for(reviewer.id, team.slug).create({
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
        TeamEvents.for(user.id, team.slug).create({
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
      const result = EventCreateSchema.safeParse({
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
      const result = EventCreateSchema.safeParse({ type: 'toto', name: '', visibility: 'toto', slug: '!@#' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 3 character(s)']);
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
        expect(fieldErrors.type).toEqual(["Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'toto'"]);
        expect(fieldErrors.visibility).toEqual(["Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'"]);
      }
    });
  });
});
