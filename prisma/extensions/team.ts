import { Prisma } from '@prisma/client/app/index.js';

import { appUrl } from '../../app/libs/env/env.server.ts';

export const teamExtension = Prisma.defineExtension({
  result: {
    team: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${appUrl()}/invite/team/${invitationCode}`;
        },
      },
    },
  },
});
