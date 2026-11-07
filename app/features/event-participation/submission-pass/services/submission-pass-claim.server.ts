import { SubmissionPassAlreadyClaimedError, SubmissionPassNotFoundError } from '~/shared/errors.server.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class SubmissionPassClaim {
  constructor(private code: string) {}

  static with(code: string) {
    return new SubmissionPassClaim(code);
  }

  async check(userId: string) {
    const pass = await db.submissionPass.findUnique({ where: { code: this.code }, include: { event: true } });
    if (!pass) throw new SubmissionPassNotFoundError();
    if (pass.userId && pass.userId !== userId) throw new SubmissionPassAlreadyClaimedError();

    const { event } = pass;
    return {
      event: { name: event.name, slug: event.slug, logoUrl: resolveStorageUrl(event.logo) },
      alreadyHolds: pass.userId === userId,
    };
  }

  async claim(userId: string) {
    const { count } = await db.submissionPass.updateMany({
      where: { code: this.code, OR: [{ userId: null }, { userId }] },
      data: { userId },
    });
    const pass = await db.submissionPass.findUnique({ where: { code: this.code }, include: { event: true } });
    if (!pass) throw new SubmissionPassNotFoundError();
    if (count === 0) throw new SubmissionPassAlreadyClaimedError();
    return { event: { slug: pass.event.slug } };
  }
}
