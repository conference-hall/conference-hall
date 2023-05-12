import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { removeMember } from './remove-member.server';

describe('#removeMember', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await teamFactory({ owners: [owner], members: [member] });

    await removeMember(orga.slug, owner.id, member.id);

    const updated = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: orga.id } },
    });
    expect(updated).toBeNull();
  });

  it('throws an error when user tries to remove itself', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const orga = await teamFactory({ owners: [owner] });

    await expect(removeMember(orga.slug, owner.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error when user is not owner of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await teamFactory({ owners: [owner], members: [member] });

    await expect(removeMember(orga.slug, member.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
