import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { removeMember } from './remove-member.server';

describe('#removeMember', () => {
  it('removes a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const team = await teamFactory({ owners: [owner], members: [member] });

    await removeMember(team.slug, owner.id, member.id);

    const updated = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: team.id } },
    });
    expect(updated).toBeNull();
  });

  it('throws an error when user tries to remove itself', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const team = await teamFactory({ owners: [owner] });

    await expect(removeMember(team.slug, owner.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error when user is not owner of the team', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const team = await teamFactory({ owners: [owner], members: [member] });

    await expect(removeMember(team.slug, member.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
