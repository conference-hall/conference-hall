import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { organizerKeyFactory } from 'tests/factories/organizer-key';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { hasOrganizerAccess, validateOrganizerAccess } from './access.server';

describe('#hasOrganizerAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('return true if user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(true);
  });

  it('return true if user belongs to an organization', async () => {
    const user = await userFactory();
    await organizationFactory({ members: [user] });
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(true);
  });

  it('returns false if user does not have organizer key or organizations', async () => {
    const user = await userFactory();
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(false);
  });
});

describe('#validateOrganizerAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the user organizer key when key is valid', async () => {
    const key = await organizerKeyFactory();
    const user = await userFactory();
    await validateOrganizerAccess(user.id, key.id);
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBe(key.id);
  });

  it('return an error when key does not exist', async () => {
    const user = await userFactory();
    const errors = await validateOrganizerAccess(user.id, 'unknown');
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBeNull();
    expect(errors?.fieldErrors?.key).toEqual(['Invalid API key']);
  });

  it('return an error when key is revoked', async () => {
    const key = await organizerKeyFactory({ attributes: { revokedAt: new Date() } });
    const user = await userFactory();
    const errors = await validateOrganizerAccess(user.id, key.id);
    expect(errors?.fieldErrors?.key).toEqual(['Invalid API key']);
  });
});
