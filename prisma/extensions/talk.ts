import { Prisma } from '@prisma/client';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const env = getSharedServerEnv();

export const talkExtension = Prisma.defineExtension({
  result: {
    talk: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${env.APP_URL}/invite/talk/${invitationCode}`;
        },
      },
    },
  },
});
