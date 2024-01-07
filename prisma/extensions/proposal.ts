import { Prisma } from '@prisma/client';

import { appUrl } from '../../app/libs/env/env.server.ts';

export const proposalExtension = Prisma.defineExtension({
  result: {
    proposal: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${appUrl()}/invite/proposal/${invitationCode}`;
        },
      },
    },
  },
});
