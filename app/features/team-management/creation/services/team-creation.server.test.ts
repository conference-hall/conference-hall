import { teamAccessRequestFactory } from 'tests/factories/team-access-request.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { TeamCreateSchema, TeamCreation } from './team-creation.server.ts';

describe('TeamCreation', () => {
  describe('create', () => {
    it('creates a team with valid accepted token for user without teams', async () => {
      const user = await userFactory();
      const request = await teamAccessRequestFactory({
        attributes: { status: 'ACCEPTED', token: 'valid-token' },
      });

      const team = await TeamCreation.for(user.id).create({ name: 'My Team', slug: 'my-team' }, 'valid-token');

      expect(team.name).toBe('My Team');
      const member = await db.teamMember.findFirst({ where: { memberId: user.id, teamId: team.id } });
      expect(member?.role).toBe('OWNER');

      const updated = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(updated?.status).toBe('COMPLETED');
    });

    it('allows team creation without token for user with existing teams', async () => {
      const user = await userFactory();
      await teamFactory({ owners: [user] });

      const team = await TeamCreation.for(user.id).create({ name: 'Second Team', slug: 'second-team' });

      expect(team.name).toBe('Second Team');
    });

    it('throws when user has no teams and no token provided', async () => {
      const user = await userFactory();

      await expect(TeamCreation.for(user.id).create({ name: 'Team', slug: 'team' })).rejects.toThrow(
        ForbiddenOperationError,
      );
    });

    it('throws when token is invalid', async () => {
      const user = await userFactory();

      await expect(TeamCreation.for(user.id).create({ name: 'Team', slug: 'team' }, 'invalid')).rejects.toThrow(
        ForbiddenOperationError,
      );
    });

    it('throws when token is already consumed', async () => {
      const user = await userFactory();
      await teamAccessRequestFactory({
        attributes: { status: 'COMPLETED', token: 'used-token' },
      });

      await expect(TeamCreation.for(user.id).create({ name: 'Team', slug: 'team' }, 'used-token')).rejects.toThrow(
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
