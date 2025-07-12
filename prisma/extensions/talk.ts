import { Prisma } from '@prisma/client';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

export const talkExtension = Prisma.defineExtension({
  result: {
    talk: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${APP_URL}/invite/talk/${invitationCode}`;
        },
      },
    },
  },
});
