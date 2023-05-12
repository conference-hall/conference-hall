import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { changeMemberRole } from './change-role.server';

describe('#changeMemberRole', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('changes the role of a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await teamFactory({ owners: [owner], members: [member] });

    await changeMemberRole(orga.slug, owner.id, member.id, 'REVIEWER');

    const updated = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: orga.id } },
    });
    expect(updated?.role).toEqual('REVIEWER');
  });

  it('throws an error when user updates its own role of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const orga = await teamFactory({ owners: [owner] });

    await expect(changeMemberRole(orga.slug, owner.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error when user is not owner of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await teamFactory({ owners: [owner], members: [member] });

    await expect(changeMemberRole(orga.slug, member.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
