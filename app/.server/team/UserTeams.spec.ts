import type { User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';

import { TeamCreateSchema, UserTeams } from './UserTeams.ts';

describe('UserTeams', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory({ isOrganizer: true });
  });

  describe('list', () => {
    it("returns user's teams", async () => {
      const orga1 = await teamFactory({ attributes: { name: 'A' }, owners: [user] });
      const orga2 = await teamFactory({ attributes: { name: 'B' }, reviewers: [user] });
      const orga3 = await teamFactory({ attributes: { name: 'C' }, members: [user] });

      const teams = await UserTeams.for(user.id).list();

      expect(teams).toEqual([
        { slug: orga1.slug, name: 'A', role: 'OWNER' },
        { slug: orga2.slug, name: 'B', role: 'REVIEWER' },
        { slug: orga3.slug, name: 'C', role: 'MEMBER' },
      ]);
    });
  });

  describe('create', () => {
    it('creates the team and add the user as owner', async () => {
      const result = await UserTeams.for(user.id).create({ name: 'Hello world', slug: 'hello-world' });

      const team = await db.team.findUnique({ where: { slug: result.slug } });
      expect(team?.name).toBe('Hello world');
      expect(team?.slug).toBe('hello-world');

      if (!team) throw new Error('Team not found');

      const orgaMember = await db.teamMember.findUnique({
        where: { memberId_teamId: { memberId: user.id, teamId: team.id } },
      });
      expect(orgaMember?.role).toBe('OWNER');
    });

    it('throws an error if user does not have organizer access', async () => {
      const user = await userFactory();
      await expect(UserTeams.for(user.id).create({ name: 'Hello world', slug: 'hello-world' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('returns an error when slug already exists', async () => {
      await teamFactory({ attributes: { slug: 'hello-world' } });

      await expect(UserTeams.for(user.id).create({ name: 'Hello world', slug: 'hello-world' })).rejects.toThrowError(
        SlugAlreadyExistsError,
      );
    });
  });

  describe('Validate TeamCreateSchema', () => {
    it('validates the team data', async () => {
      const result = TeamCreateSchema.safeParse({ name: 'Hello world', slug: 'hello-world' });
      expect(result.success && result.data).toEqual({ name: 'Hello world', slug: 'hello-world' });
    });

    it('returns errors when data invalid', async () => {
      const result = TeamCreateSchema.safeParse({ name: 'H', slug: 'h' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 3 character(s)']);
        expect(fieldErrors.slug).toEqual(['String must contain at least 3 character(s)']);
      }
    });

    it('validates slug format (alpha-num and dash only)', async () => {
      const result = TeamCreateSchema.safeParse({ name: 'Hello world', slug: 'Hello world/' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
      }
    });
  });
});
