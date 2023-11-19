import type { User } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.ts';

import { MyTeamSettings, TeamUpdateSchema } from './MyTeamSettings';

describe('MyTeamSettings', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('update', () => {
    it('updates the team settings', async () => {
      const team = await teamFactory({
        attributes: { name: 'Hello world', slug: 'hello-world' },
        owners: [user],
      });

      let result = await MyTeamSettings.for(user.id, team.slug).update({ name: 'name', slug: 'slug' });
      expect(result.name).toEqual('name');
      expect(result.slug).toEqual('slug');

      result = await MyTeamSettings.for(user.id, result.slug).update({ name: 'name 2', slug: 'slug' });
      expect(result.name).toEqual('name 2');
      expect(result.slug).toEqual('slug');
    });

    it('throws an error if user is not owner', async () => {
      const team = await teamFactory({ members: [user] });

      await expect(MyTeamSettings.for(user.id, team.slug).update({ name: 'name', slug: 'slug' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if the slug already exists', async () => {
      const team = await teamFactory({ attributes: { slug: 'hello-world' }, owners: [user] });
      await teamFactory({ attributes: { slug: 'hello-world-exist' }, owners: [user] });

      await expect(
        MyTeamSettings.for(user.id, team.slug).update({ name: 'Hello world', slug: 'hello-world-exist' }),
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
