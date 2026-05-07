import { db } from '../../../../../prisma/db.server.ts';
import { TeamAccessRequest } from './team-access-request.server.ts';

describe('TeamAccessRequest', () => {
  describe('submit', () => {
    it('creates a new pending request', async () => {
      await TeamAccessRequest.submit({ eventName: 'My Conference', email: 'test@example.com' });

      const request = await db.teamAccessRequest.findFirst({ where: { email: 'test@example.com' } });
      expect(request).not.toBeNull();
      expect(request?.eventName).toBe('My Conference');
      expect(request?.status).toBe('PENDING');
      expect(request?.token).toBeNull();
    });

    it('updates existing pending request for same email', async () => {
      await TeamAccessRequest.submit({ eventName: 'Old Conference', email: 'test@example.com' });
      await TeamAccessRequest.submit({ eventName: 'New Conference', email: 'test@example.com' });

      const requests = await db.teamAccessRequest.findMany({ where: { email: 'test@example.com' } });
      expect(requests).toHaveLength(1);
      expect(requests[0].eventName).toBe('New Conference');
    });

    it('creates separate request for different email', async () => {
      await TeamAccessRequest.submit({ eventName: 'Conference A', email: 'a@example.com' });
      await TeamAccessRequest.submit({ eventName: 'Conference B', email: 'b@example.com' });

      const count = await db.teamAccessRequest.count();
      expect(count).toBe(2);
    });
  });
});
