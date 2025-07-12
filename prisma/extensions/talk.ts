import { Prisma } from '@prisma/client';

import { appUrl } from '../../servers/environment.server.ts';

export const talkExtension = Prisma.defineExtension({
  result: {
    talk: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${appUrl()}/invite/talk/${invitationCode}`;
        },
      },
    },
  },
});
