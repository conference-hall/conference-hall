import { eventFactory } from 'tests/factories/events.ts';
import { submissionPassFactory } from 'tests/factories/submission-passes.ts';
import { userFactory } from 'tests/factories/users.ts';
import { SubmissionPassAlreadyClaimedError, SubmissionPassNotFoundError } from '~/shared/errors.server.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { SubmissionPassClaim } from './submission-pass-claim.server.ts';

describe('SubmissionPassClaim', () => {
  describe('#check', () => {
    it('returns the event of an unused pass without claiming it', async () => {
      const event = await eventFactory();
      const pass = await submissionPassFactory({ event });
      const speaker = await userFactory();

      const result = await SubmissionPassClaim.with(pass.code).check(speaker.id);

      expect(result).toEqual({
        event: { name: event.name, slug: event.slug, logoUrl: resolveStorageUrl(event.logo) },
        alreadyHolds: false,
      });
      const unchanged = await db.submissionPass.findUnique({ where: { id: pass.id } });
      expect(unchanged?.userId).toBeNull();
    });

    it('reports that the user already holds the pass', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const pass = await submissionPassFactory({ event, user: speaker });

      const result = await SubmissionPassClaim.with(pass.code).check(speaker.id);

      expect(result).toEqual({
        event: { name: event.name, slug: event.slug, logoUrl: resolveStorageUrl(event.logo) },
        alreadyHolds: true,
      });
    });

    it('refuses a pass already held by another user', async () => {
      const event = await eventFactory();
      const pass = await submissionPassFactory({ event, user: await userFactory() });
      const other = await userFactory();

      await expect(SubmissionPassClaim.with(pass.code).check(other.id)).rejects.toThrow(
        SubmissionPassAlreadyClaimedError,
      );
    });

    it('refuses an unknown code', async () => {
      const speaker = await userFactory();

      await expect(SubmissionPassClaim.with('XXX').check(speaker.id)).rejects.toThrow(SubmissionPassNotFoundError);
    });
  });

  describe('#claim', () => {
    it('makes the first user the holder of the pass and returns the event', async () => {
      const event = await eventFactory();
      const pass = await submissionPassFactory({ event });
      const speaker = await userFactory();

      const result = await SubmissionPassClaim.with(pass.code).claim(speaker.id);

      expect(result).toEqual({ event: { slug: event.slug } });
      const claimed = await db.submissionPass.findUnique({ where: { id: pass.id } });
      expect(claimed?.userId).toBe(speaker.id);
    });

    it('does not create an event speaker', async () => {
      const event = await eventFactory();
      const pass = await submissionPassFactory({ event });
      const speaker = await userFactory();

      await SubmissionPassClaim.with(pass.code).claim(speaker.id);

      const eventSpeakers = await db.eventSpeaker.findMany({ where: { eventId: event.id } });
      expect(eventSpeakers).toEqual([]);
    });

    it('succeeds without change when the holder reopens their pass', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const pass = await submissionPassFactory({ event, user: speaker });

      const result = await SubmissionPassClaim.with(pass.code).claim(speaker.id);

      expect(result).toEqual({ event: { slug: event.slug } });
      const claimed = await db.submissionPass.findUnique({ where: { id: pass.id } });
      expect(claimed?.userId).toBe(speaker.id);
    });

    it('refuses a pass already held by another user', async () => {
      const event = await eventFactory();
      const holder = await userFactory();
      const pass = await submissionPassFactory({ event, user: holder });
      const other = await userFactory();

      await expect(SubmissionPassClaim.with(pass.code).claim(other.id)).rejects.toThrow(
        SubmissionPassAlreadyClaimedError,
      );
      const claimed = await db.submissionPass.findUnique({ where: { id: pass.id } });
      expect(claimed?.userId).toBe(holder.id);
    });

    it('refuses an unknown code', async () => {
      const speaker = await userFactory();

      await expect(SubmissionPassClaim.with('XXX').claim(speaker.id)).rejects.toThrow(SubmissionPassNotFoundError);
    });

    it('refuses a deleted pass', async () => {
      const event = await eventFactory();
      const pass = await submissionPassFactory({ event });
      await db.submissionPass.delete({ where: { id: pass.id } });
      const speaker = await userFactory();

      await expect(SubmissionPassClaim.with(pass.code).claim(speaker.id)).rejects.toThrow(SubmissionPassNotFoundError);
    });
  });
});
