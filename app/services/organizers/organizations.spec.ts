import { OrganizationRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError, InvitationNotFoundError, OrganizationNotFoundError } from '../errors';
import {
  changeMemberRole,
  createOrganization,
  getInvitationLink,
  getOrganizationEvents,
  getOrganizationMembers,
  getUserRole,
  inviteMemberToOrganization,
  removeMember,
  updateOrganization,
} from './organizations.server';

describe('#getUserRole', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the role of the user in the organization', async () => {
    const user = await userFactory();
    const orga = await organizationFactory({ members: [user] });
    const role = await getUserRole(orga.slug, user.id);
    expect(role).toEqual('MEMBER');
  });

  it('returns null if user does not belong to the organization', async () => {
    const user = await userFactory();
    const orga = await organizationFactory();
    const role = await getUserRole(orga.slug, user.id);
    expect(role).toBeNull();
  });
});

describe('#getOrganizationEvents', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization events', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user], attributes: { slug: 'my-orga' } });
    await eventFactory({ attributes: { name: 'Event 1', slug: 'event1' }, organization, traits: ['conference'] });
    await eventFactory({ attributes: { name: 'Event 2', slug: 'event2' }, organization, traits: ['meetup'] });

    const organization2 = await organizationFactory({ owners: [user] });
    await eventFactory({ traits: ['conference-cfp-open'], organization: organization2 });

    const events = await getOrganizationEvents('my-orga', user.id);
    expect(events).toEqual([
      { name: 'Event 1', slug: 'event1', type: 'CONFERENCE' },
      { name: 'Event 2', slug: 'event2', type: 'MEETUP' },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'my-orga' } });
    await eventFactory({ organization });

    const events = await getOrganizationEvents('my-orga', user.id);
    expect(events).toEqual([]);
  });
});

describe('#getOrganizationMembers', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization members', async () => {
    const owner = await userFactory({
      traits: ['clark-kent'],
      attributes: { id: '1', photoURL: 'https://img.com/a.png' },
    });
    const member = await userFactory({
      traits: ['bruce-wayne'],
      attributes: { id: '2', photoURL: 'https://img.com/b.png' },
    });
    const reviewer = await userFactory({
      traits: ['peter-parker'],
      attributes: { id: '3', photoURL: 'https://img.com/c.png' },
    });
    const organization = await organizationFactory({
      owners: [owner],
      members: [member],
      reviewers: [reviewer],
      attributes: { slug: 'my-orga' },
    });
    const other = await userFactory();
    await organizationFactory({ owners: [other] });

    const members = await getOrganizationMembers(organization.slug, owner.id);
    expect(members).toEqual([
      { id: '2', name: 'Bruce Wayne', role: 'MEMBER', photoURL: 'https://img.com/b.png' },
      { id: '1', name: 'Clark Kent', role: 'OWNER', photoURL: 'https://img.com/a.png' },
      { id: '3', name: 'Peter Parker', role: 'REVIEWER', photoURL: 'https://img.com/c.png' },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const owner = await userFactory();
    const organization = await organizationFactory({ owners: [owner], attributes: { slug: 'my-orga' } });

    const events = await getOrganizationMembers(organization.slug, user.id);
    expect(events).toEqual([]);
  });
});

describe('#changeMemberRole', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('changes the role of a member when user has owner role', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await organizationFactory({ owners: [owner], members: [member] });

    await changeMemberRole(orga.slug, owner.id, member.id, 'REVIEWER');

    const updated = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: member.id, organizationId: orga.id } },
    });
    expect(updated?.role).toEqual('REVIEWER');
  });

  it('throws an error when user updates its own role of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const orga = await organizationFactory({ owners: [owner] });

    await expect(changeMemberRole(orga.slug, owner.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error when user is not owner of the organization', async () => {
    const owner = await userFactory({ traits: ['clark-kent'], attributes: { id: '1' } });
    const member = await userFactory({ traits: ['bruce-wayne'], attributes: { id: '2' } });
    const orga = await organizationFactory({ owners: [owner], members: [member] });

    await expect(changeMemberRole(orga.slug, member.id, owner.id, 'REVIEWER')).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

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

describe('#getInvitationLink', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the role of the user in the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });
    const invite = await inviteFactory({ organization, user });
    const link = await getInvitationLink(organization.slug, user.id);
    expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
  });

  it('returns nothing if no invite found', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });
    const link = await getInvitationLink(organization.slug, user.id);
    expect(link).toBeUndefined();
  });
});

describe('#inviteMemberToOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds the member as reviewer to the organization', async () => {
    const owner = await userFactory();
    const member = await userFactory();
    const organization = await organizationFactory({ owners: [owner] });
    const invite = await inviteFactory({ organization, user: owner });

    await inviteMemberToOrganization(invite?.id!, member.id);

    const orgaMember = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: member.id, organizationId: organization.id } },
    });
    expect(orgaMember?.role).toBe(OrganizationRole.REVIEWER);
  });

  it('throws an error when invitation not found', async () => {
    const user = await userFactory();
    await expect(inviteMemberToOrganization('XXX', user.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#createOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates the organization and add the user as owner', async () => {
    const user = await userFactory();
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });

    const organization = await db.organization.findUnique({ where: { slug: result.slug } });
    expect(organization?.name).toBe('Hello world');
    expect(organization?.slug).toBe('hello-world');

    const orgaMember = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: user.id, organizationId: organization?.id! } },
    });
    expect(orgaMember?.role).toBe(OrganizationRole.OWNER);
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    await organizationFactory({ attributes: { slug: 'hello-world' }, owners: [user] });
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });
    expect(result?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });
});

describe('#updateOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({
      attributes: { name: 'Hello world', slug: 'hello-world' },
      owners: [user],
    });
    const result = await updateOrganization(organization.slug, user.id, {
      name: 'Hello world updated',
      slug: 'hello-world-updated',
    });
    expect(result.slug).toEqual('hello-world-updated');
  });

  it('throws an error if user is not owner', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });

    await expect(updateOrganization(organization.slug, user.id, { name: 'name', slug: 'slug' })).rejects.toThrowError(
      OrganizationNotFoundError
    );
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'hello-world-1' }, owners: [user] });
    await organizationFactory({ attributes: { slug: 'hello-world-2' }, owners: [user] });
    const result = await updateOrganization(organization.slug, user.id, {
      name: 'Hello world',
      slug: 'hello-world-2',
    });
    expect(result?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });
});
