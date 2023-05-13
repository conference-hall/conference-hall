import { TeamRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { TeamSaveSchema, createTeam } from './create-team.server';
import { parse } from '@conform-to/zod';

describe('#createOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates the team and add the user as owner', async () => {
    const user = await userFactory();
    const result = await createTeam(user.id, { name: 'Hello world', slug: 'hello-world' });

    const team = await db.team.findUnique({ where: { slug: result.slug } });
    expect(team?.name).toBe('Hello world');
    expect(team?.slug).toBe('hello-world');

    const orgaMember = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: user.id, teamId: team?.id! } },
    });
    expect(orgaMember?.role).toBe(TeamRole.OWNER);
  });
});

describe('Validate TeamSaveSchema', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('validates the team data', async () => {
    const form = new FormData();
    form.append('name', 'Hello world');
    form.append('slug', 'hello-world-1');

    const result = await parse(form, { schema: TeamSaveSchema, async: true });
    expect(result.value).toEqual({ name: 'Hello world', slug: 'hello-world-1' });
  });

  it('returns errors when data too small', async () => {
    const form = new FormData();
    form.append('name', 'H');
    form.append('slug', 'h');

    const result = await parse(form, { schema: TeamSaveSchema, async: true });
    expect(result?.error.name).toBe('String must contain at least 3 character(s)');
    expect(result?.error.slug).toBe('String must contain at least 3 character(s)');
  });

  it('validates slug format (alpha-num and dash only)', async () => {
    const form = new FormData();
    form.append('name', 'Hello world');
    form.append('slug', 'Hello world/');

    const result = await parse(form, { schema: TeamSaveSchema, async: true });
    expect(result?.error.slug).toEqual('Must only contain lower case alphanumeric and dashes (-).');
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    await teamFactory({ attributes: { slug: 'hello-world' }, owners: [user] });

    const form = new FormData();
    form.append('name', 'Hello world');
    form.append('slug', 'hello-world');

    const result = await parse(form, { schema: TeamSaveSchema, async: true });
    expect(result?.error?.slug).toEqual('This URL already exists, please try another one.');
  });
});
