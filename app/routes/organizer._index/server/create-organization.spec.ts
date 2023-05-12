import { TeamRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { createOrganization } from './create-organization.server';

describe('#createOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates the team and add the user as owner', async () => {
    const user = await userFactory();
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });

    const team = await db.team.findUnique({ where: { slug: result.slug } });
    expect(team?.name).toBe('Hello world');
    expect(team?.slug).toBe('hello-world');

    const orgaMember = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: user.id, teamId: team?.id! } },
    });
    expect(orgaMember?.role).toBe(TeamRole.OWNER);
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    await teamFactory({ attributes: { slug: 'hello-world' }, owners: [user] });
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });
    expect(result?.fieldErrors?.slug).toEqual('This URL already exists, please try another one.');
  });
});
