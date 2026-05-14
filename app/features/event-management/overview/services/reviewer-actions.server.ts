import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class ReviewerActions {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new ReviewerActions(authorizedEvent);
  }

  async dismissReviewsByUser(userId: string) {
    const { permissions, event } = this.authorizedEvent;
    if (!permissions.canDismissReviews) throw new ForbiddenOperationError();

    await db.review.updateMany({
      where: { userId, proposal: { eventId: event.id }, dismissedAt: null },
      data: { dismissedAt: new Date() },
    });
  }

  async restoreReviewsByUser(userId: string) {
    const { permissions, event } = this.authorizedEvent;
    if (!permissions.canDismissReviews) throw new ForbiddenOperationError();

    await db.review.updateMany({
      where: { userId, proposal: { eventId: event.id }, dismissedAt: { not: null } },
      data: { dismissedAt: null },
    });
  }
}
