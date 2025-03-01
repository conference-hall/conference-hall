import type { Team, User } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { appUrl } from '~/libs/env/env.server.ts';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';

import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { UserTeam } from './user-team.ts';

describe('UserTeam', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('needsPermission', () => {
    it('returns the member info if allowed the given permission', async () => {
      const team = await teamFactory({ owners: [user] });

      const member = await UserTeam.for(user.id, team.slug).needsPermission('canEditTeam');

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.permissions.canEditTeam).toBe(true);
      expect(member.role).toBe('OWNER');
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const team = await teamFactory({ members: [user] });
      await expect(UserTeam.for(user.id, team.slug).needsPermission('canEditTeam')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user has access to another team but not the given one', async () => {
      const team = await teamFactory();
      await teamFactory({ owners: [user] });
      await expect(UserTeam.for(user.id, team.slug).needsPermission('canEditTeam')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if team does not exist', async () => {
      await teamFactory({ owners: [user] });
      await expect(UserTeam.for(user.id, 'XXX').needsPermission('canEditTeam')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('get', () => {
    it('returns team belonging to user', async () => {
      await teamFactory({ members: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
      const team = await teamFactory({ owners: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

      const myTeam = await UserTeam.for(user.id, team.slug).get();

      expect(myTeam).toEqual({
        id: team.id,
        name: 'My team 2',
        slug: 'my-team2',
        invitationLink: `${appUrl()}/invite/team/${team.invitationCode}`,
        userRole: 'OWNER',
        userPermissions: expect.objectContaining({ canEditTeam: true }),
      });
    });

    it('does not return the invitation link if the user is reviewer', async () => {
      const team = await teamFactory({ reviewers: [user] });

      const myTeam = await UserTeam.for(user.id, team.slug).get();

      expect(myTeam.invitationLink).toBe(undefined);
    });

    it('throws an error when user is not member of the team', async () => {
      const team = await teamFactory({ attributes: { name: 'My team', slug: 'my-team' } });
      await expect(UserTeam.for(user.id, team.slug).get()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(UserTeam.for(user.id, 'XXX').get()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('delete', () => {
    it('deletes the team and its relations', async () => {
      const team = await teamFactory({ owners: [user], attributes: { name: 'My team', slug: 'my-team' } });
      const event = await eventFactory({ team });

      await UserTeam.for(user.id, team.slug).delete();

      const deletedEvent = await db.event.findUnique({ where: { id: event.id } });
      expect(deletedEvent).toBeNull();

      const deletedMember = await db.teamMember.findUnique({
        where: { memberId_teamId: { memberId: user.id, teamId: team.id } },
      });
      expect(deletedMember).toBeNull();

      const deletedTeam = await db.team.findUnique({ where: { id: team.id } });
      expect(deletedTeam).toBeNull();
    });

    it('throws an error if user is not owner', async () => {
      const team = await teamFactory({ members: [user] });
      await expect(UserTeam.for(user.id, team.slug).delete()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(UserTeam.for(user.id, 'XXX').delete()).rejects.toThrowError(ForbiddenOperationError);
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
  });

  describe('#buildUpdateSchema', () => {
    let team: Team;

    beforeEach(async () => {
      team = await teamFactory({ owners: [user], attributes: { name: 'Hello world', slug: 'hello-world' } });
    });

    it('validates the team data', async () => {
      const schema = await UserTeam.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'hello-world' });
      expect(result.success && result.data).toEqual({ name: 'Hello world', slug: 'hello-world' });
    });

    it('returns errors when data invalid', async () => {
      const schema = await UserTeam.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'H', slug: 'h' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 3 character(s)']);
        expect(fieldErrors.slug).toEqual(['String must contain at least 3 character(s)']);
      }
    });

    it('validates slug format (alpha-num and dash only)', async () => {
      const schema = await UserTeam.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'Hello world/' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
      }
    });

    it('returns an error when slug already exists', async () => {
      await teamFactory({ attributes: { slug: 'hello-world2' } });

      const schema = await UserTeam.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'hello-world2' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.slug).toEqual(['This URL already exists.']);
      }
    });
  });
});
