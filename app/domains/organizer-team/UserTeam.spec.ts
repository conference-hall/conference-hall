import type { User } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { config } from '~/libs/config.ts';
import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.ts';

import { TeamUpdateSchema, UserTeam } from './UserTeam';

describe('UserTeam', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('allowedFor', () => {
    it('returns the member info if allowed for the team', async () => {
      const team = await teamFactory({ owners: [user] });

      const member = await UserTeam.for(user.id, team.slug).allowedFor(['OWNER']);

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.role).toEqual('OWNER');
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const team = await teamFactory({ members: [user] });
      await expect(UserTeam.for(user.id, team.slug).allowedFor(['OWNER'])).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user has access to another team but not the given one', async () => {
      const team = await teamFactory();
      await teamFactory({ owners: [user] });
      await expect(UserTeam.for(user.id, team.slug).allowedFor(['OWNER'])).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if team does not exist', async () => {
      await teamFactory({ owners: [user] });
      await expect(UserTeam.for(user.id, 'XXX').allowedFor(['OWNER'])).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('get', () => {
    it('returns team belonging to user', async () => {
      await teamFactory({ owners: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
      const team = await teamFactory({ members: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

      const myTeam = await UserTeam.for(user.id, team.slug).get();

      expect(myTeam).toEqual({
        id: team.id,
        name: 'My team 2',
        slug: 'my-team2',
        role: 'MEMBER',
        invitationLink: `${config.appUrl}/invite/team/${team.invitationCode}`,
      });
    });

    it('throws an error when user is not member of the team', async () => {
      const team = await teamFactory({ attributes: { name: 'My team', slug: 'my-team' } });
      await expect(UserTeam.for(user.id, team.slug).get()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(UserTeam.for(user.id, 'XXX').get()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('updateSettings', () => {
    it('updates the team settings', async () => {
      const team = await teamFactory({
        attributes: { name: 'Hello world', slug: 'hello-world' },
        owners: [user],
      });

      let result = await UserTeam.for(user.id, team.slug).updateSettings({ name: 'name', slug: 'slug' });
      expect(result.name).toEqual('name');
      expect(result.slug).toEqual('slug');

      result = await UserTeam.for(user.id, result.slug).updateSettings({ name: 'name 2', slug: 'slug' });
      expect(result.name).toEqual('name 2');
      expect(result.slug).toEqual('slug');
    });

    it('throws an error if user is not owner', async () => {
      const team = await teamFactory({ members: [user] });

      await expect(
        UserTeam.for(user.id, team.slug).updateSettings({ name: 'name', slug: 'slug' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if the slug already exists', async () => {
      const team = await teamFactory({ attributes: { slug: 'hello-world' }, owners: [user] });
      await teamFactory({ attributes: { slug: 'hello-world-exist' }, owners: [user] });

      await expect(
        UserTeam.for(user.id, team.slug).updateSettings({ name: 'Hello world', slug: 'hello-world-exist' }),
      ).rejects.toThrowError(SlugAlreadyExistsError);
    });
  });

  describe('Validate TeamUpdateSchema', () => {
    it('validates the team data', async () => {
      const result = TeamUpdateSchema.safeParse({ name: 'Hello world', slug: 'hello-world' });
      expect(result.success && result.data).toEqual({ name: 'Hello world', slug: 'hello-world' });
    });

    it('returns errors when data invalid', async () => {
      const result = TeamUpdateSchema.safeParse({ name: 'H', slug: 'h' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 3 character(s)']);
        expect(fieldErrors.slug).toEqual(['String must contain at least 3 character(s)']);
      }
    });

    it('validates slug format (alpha-num and dash only)', async () => {
      const result = TeamUpdateSchema.safeParse({ name: 'Hello world', slug: 'Hello world/' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
      }
    });
  });
});
