import { InviteType } from '@prisma/client';
import { db } from '../../../libs/db';

export async function revokeLink(type: InviteType, entityId: string, userId: string) {
  switch (type) {
    case InviteType.TALK: {
      return db.invite.deleteMany({
        where: {
          type: InviteType.TALK,
          talk: { id: entityId, speakers: { some: { id: userId } } },
        },
      });
    }
    case InviteType.PROPOSAL: {
      return db.invite.deleteMany({
        where: {
          type: InviteType.PROPOSAL,
          proposal: { id: entityId, speakers: { some: { id: userId } } },
        },
      });
    }
    case InviteType.ORGANIZATION: {
      return db.invite.deleteMany({
        where: {
          type: InviteType.ORGANIZATION,
          organization: { id: entityId, members: { some: { memberId: userId } } },
        },
      });
    }
  }
}
