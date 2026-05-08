import { randomUUID } from 'node:crypto';
import { teamAccessRequestFactory } from 'tests/factories/team-access-requests.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { TeamAccessRequests } from './team-access-request.server.ts';

describe('TeamAccessRequests', () => {
  describe('submit', () => {
    it('creates a new request with PENDING status', async () => {
      await TeamAccessRequests.submit({ eventName: 'DevFest', email: 'test@example.com' });

      const request = await db.teamAccessRequest.findFirst({ where: { email: 'test@example.com' } });
      expect(request).not.toBeNull();
      expect(request?.eventName).toBe('DevFest');
      expect(request?.status).toBe('PENDING');
    });

    it('does not create duplicate when pending request exists for same email', async () => {
      await TeamAccessRequests.submit({ eventName: 'DevFest', email: 'dup@example.com' });
      await TeamAccessRequests.submit({ eventName: 'Other Event', email: 'dup@example.com' });

      const requests = await db.teamAccessRequest.findMany({ where: { email: 'dup@example.com' } });
      expect(requests).toHaveLength(1);
      expect(requests[0].eventName).toBe('DevFest');
    });
  });

  describe('activate', () => {
    it('marks token as used and grants organizer access', async () => {
      const user = await userFactory();
      const token = randomUUID();
      const request = await teamAccessRequestFactory({ attributes: { status: 'ACCEPTED', token } });

      await TeamAccessRequests.activate(token, user.id);

      const updated = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(updated?.usedAt).not.toBeNull();

      const updatedUser = await db.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.organizerKey).not.toBeNull();
    });

    it('throws when token does not exist', async () => {
      const user = await userFactory();
      await expect(TeamAccessRequests.activate('nonexistent', user.id)).rejects.toThrow(ForbiddenOperationError);
    });

    it('succeeds idempotently when token already used by same user', async () => {
      const token = randomUUID();
      const request = await teamAccessRequestFactory({ attributes: { status: 'ACCEPTED', token, usedAt: new Date() } });
      const user = await userFactory({ attributes: { organizerKey: request.id } });

      await expect(TeamAccessRequests.activate(token, user.id)).resolves.toBeUndefined();
    });

    it('throws when token is already used by another user', async () => {
      const user = await userFactory();
      const token = randomUUID();
      const request = await teamAccessRequestFactory({ attributes: { status: 'ACCEPTED', token, usedAt: new Date() } });
      await userFactory({ attributes: { organizerKey: request.id } });

      await expect(TeamAccessRequests.activate(token, user.id)).rejects.toThrow(ForbiddenOperationError);
    });
  });

  describe('accept', () => {
    it('sets status to ACCEPTED and generates token', async () => {
      const request = await teamAccessRequestFactory();

      await TeamAccessRequests.accept(request.id);

      const updated = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(updated?.status).toBe('ACCEPTED');
      expect(updated?.token).not.toBeNull();
    });
  });

  describe('reject', () => {
    it('sets status to REJECTED', async () => {
      const request = await teamAccessRequestFactory();

      await TeamAccessRequests.reject(request.id);

      const updated = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(updated?.status).toBe('REJECTED');
    });
  });
});
