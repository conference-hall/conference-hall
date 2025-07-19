import type { Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { TeamSettings } from './team-settings.server.ts';

describe('TeamSettings', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('delete', () => {
    it('deletes the team and its relations', async () => {
      const team = await teamFactory({ owners: [user], attributes: { name: 'My team', slug: 'my-team' } });
      const event = await eventFactory({ team });

      await TeamSettings.for(user.id, team.slug).delete();

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
      await expect(TeamSettings.for(user.id, team.slug).delete()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(TeamSettings.for(user.id, 'XXX').delete()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('updateSettings', () => {
    it('updates the team settings', async () => {
      const team = await teamFactory({
        attributes: { name: 'Hello world', slug: 'hello-world' },
        owners: [user],
      });

      let result = await TeamSettings.for(user.id, team.slug).updateSettings({ name: 'name', slug: 'slug' });
      expect(result.name).toEqual('name');
      expect(result.slug).toEqual('slug');

      result = await TeamSettings.for(user.id, result.slug).updateSettings({ name: 'name 2', slug: 'slug' });
      expect(result.name).toEqual('name 2');
      expect(result.slug).toEqual('slug');
    });

    it('throws an error if user is not owner', async () => {
      const team = await teamFactory({ members: [user] });

      await expect(
        TeamSettings.for(user.id, team.slug).updateSettings({ name: 'name', slug: 'slug' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#buildUpdateSchema', () => {
    let team: Team;

    beforeEach(async () => {
      team = await teamFactory({ owners: [user], attributes: { name: 'Hello world', slug: 'hello-world' } });
    });

    it('validates the team data', async () => {
      const schema = await TeamSettings.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'hello-world' });
      expect(result.success && result.data).toEqual({ name: 'Hello world', slug: 'hello-world' });
    });

    it('returns errors when data invalid', async () => {
      const schema = await TeamSettings.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'H', slug: 'h' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.name).toEqual(['Too small: expected string to have >=3 characters']);
        expect(fieldErrors.slug).toEqual(['Too small: expected string to have >=3 characters']);
      }
    });

    it('validates slug format (alpha-num and dash only)', async () => {
      const schema = await TeamSettings.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'Hello world/' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
      }
    });

    it('returns an error when slug already exists', async () => {
      await teamFactory({ attributes: { slug: 'hello-world2' } });

      const schema = await TeamSettings.for(user.id, team.slug).buildUpdateSchema();
      const result = await schema.safeParseAsync({ name: 'Hello world', slug: 'hello-world2' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.slug).toEqual(['This URL already exists.']);
      }
    });
  });
});
