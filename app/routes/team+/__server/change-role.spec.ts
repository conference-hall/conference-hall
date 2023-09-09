import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { changeMemberRole } from './change-role.server';

describe('#changeMemberRole', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(async () => {
    await disconnectDB();
  });

  it('changes the role of a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const team = await teamFactory({ owners: [owner], members: [member] });

    await changeMemberRole(team.slug, owner.id, member.id, 'REVIEWER');

    const updated = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: team.id } },
    });
    expect(updated?.role).toEqual('REVIEWER');
  });

  it('throws an error when user updates its own role of the team', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const team = await teamFactory({ owners: [owner] });

    await expect(changeMemberRole(team.slug, owner.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError,
    );
  });

  it('throws an error when user is not owner of the team', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const team = await teamFactory({ owners: [owner], members: [member] });

    await expect(changeMemberRole(team.slug, member.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError,
    );
  });
});
