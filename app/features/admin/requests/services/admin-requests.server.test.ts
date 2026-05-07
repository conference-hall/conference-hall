import { teamAccessRequestFactory } from 'tests/factories/team-access-request.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { AdminRequests } from './admin-requests.server.ts';

describe('AdminRequests', () => {
  const admin = { id: 'admin-id' };

  describe('listRequests', () => {
    it('returns only pending requests ordered by createdAt desc', async () => {
      const first = await teamAccessRequestFactory({ attributes: { email: 'first@test.com' } });
      const second = await teamAccessRequestFactory({ attributes: { email: 'second@test.com' } });
      await teamAccessRequestFactory({ attributes: { email: 'accepted@test.com', status: 'ACCEPTED', token: 'tok' } });

      const requests = await AdminRequests.for(admin).listRequests();

      expect(requests).toHaveLength(2);
      expect(requests[0].id).toBe(second.id);
      expect(requests[1].id).toBe(first.id);
    });

    it('returns empty array when no pending requests', async () => {
      const requests = await AdminRequests.for(admin).listRequests();
      expect(requests).toEqual([]);
    });
  });

  describe('acceptRequest', () => {
    it('sets status to ACCEPTED with token and triggers welcome email', async () => {
      const request = await teamAccessRequestFactory({
        attributes: { eventName: 'My Event', email: 'org@test.com' },
      });

      await AdminRequests.for(admin).acceptRequest(request.id);

      const updated = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(updated?.status).toBe('ACCEPTED');
      expect(updated?.token).toBeTruthy();
      expect(updated?.acceptedAt).not.toBeNull();

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'organizers-welcome',
          to: ['org@test.com'],
        }),
      );
    });
  });

  describe('denyRequest', () => {
    it('deletes the request', async () => {
      const request = await teamAccessRequestFactory();

      await AdminRequests.for(admin).denyRequest(request.id);

      const found = await db.teamAccessRequest.findUnique({ where: { id: request.id } });
      expect(found).toBeNull();
    });
  });
});
