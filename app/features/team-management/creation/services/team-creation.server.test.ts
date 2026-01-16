import type { User } from 'prisma/generated/client.ts';
import { db } from 'prisma/db.server.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { TeamCreateSchema, TeamCreation } from './team-creation.server.ts';

describe('TeamCreation', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory({ isOrganizer: true });
  });

  describe('create', () => {
    it('creates the team and add the user as owner', async () => {
      const result = await TeamCreation.for(user.id).create({ name: 'Hello world', slug: 'hello-world' });

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
      await expect(TeamCreation.for(user.id).create({ name: 'Hello world', slug: 'hello-world' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('Validate TeamCreateSchema', () => {
    it('validates the team data', async () => {
      const result = await TeamCreateSchema.safeParseAsync({ name: 'Hello world', slug: 'hello-world' });
      expect(result.success && result.data).toEqual({ name: 'Hello world', slug: 'hello-world' });
    });

    it('returns errors when data invalid', async () => {
      const result = await TeamCreateSchema.safeParseAsync({ name: 'H', slug: 'h' });

      expect(result.success).toBe(false);
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.name).toEqual(['Too small: expected string to have >=3 characters']);
      expect(fieldErrors.slug).toEqual(['Too small: expected string to have >=3 characters']);
    });

    it('validates slug format (alpha-num and dash only)', async () => {
      const result = await TeamCreateSchema.safeParseAsync({ name: 'Hello world', slug: 'Hello world/' });

      expect(result.success).toBe(false);
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
    });

    it('returns an error when slug already exists', async () => {
      await teamFactory({ attributes: { slug: 'hello-world' } });

      const result = await TeamCreateSchema.safeParseAsync({ name: 'Hello world', slug: 'hello-world' });

      expect(result.success).toBe(false);
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.slug).toEqual(['This URL already exists.']);
    });
  });
});
