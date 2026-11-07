import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../../../../servers/environment.server.ts';
import type { SubmissionPassCreateData } from './submission-passes.schema.server.ts';

const { APP_URL } = getSharedServerEnv();

const linkOf = (code: string) => `${APP_URL}/invite/pass/${code}`;

export class SubmissionPasses {
  private constructor(private event: Event) {}

  static for(authorizedEvent: AuthorizedEvent) {
    const { event, permissions } = authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    return new SubmissionPasses(event);
  }

  async list() {
    const passes = await db.submissionPass.findMany({
      where: { eventId: this.event.id },
      include: { user: { include: { eventsSpeaker: { where: { eventId: this.event.id }, select: { id: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      unused: passes
        .filter((pass) => !pass.user)
        .map((pass) => ({ id: pass.id, label: pass.label, link: linkOf(pass.code) })),
      used: passes.flatMap(({ id, label, user }) =>
        user
          ? [
              {
                id,
                label,
                holder: { name: user.name, picture: user.picture, eventSpeakerId: user.eventsSpeaker[0]?.id ?? null },
              },
            ]
          : [],
      ),
    };
  }

  async create(data: SubmissionPassCreateData) {
    const pass = await db.submissionPass.create({ data: { label: data.label, eventId: this.event.id } });
    return { id: pass.id, label: pass.label, code: pass.code, link: linkOf(pass.code) };
  }

  async delete(passId: string) {
    await db.submissionPass.deleteMany({ where: { id: passId, eventId: this.event.id } });
  }
}
