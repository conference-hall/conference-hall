import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { ForbiddenOperationError } from '../../libs/errors';
import { removeMember } from './remove-member.server';

describe('#removeMember', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await organizationFactory({ owners: [owner], members: [member] });

    await removeMember(orga.slug, owner.id, member.id);

    const updated = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: member.id, organizationId: orga.id } },
    });
    expect(updated).toBeNull();
  });

  it('throws an error when user tries to remove itself', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const orga = await organizationFactory({ owners: [owner] });

    await expect(removeMember(orga.slug, owner.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error when user is not owner of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await organizationFactory({ owners: [owner], members: [member] });

    await expect(removeMember(orga.slug, member.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
