import { Prisma } from '@prisma/client';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

export const teamExtension = Prisma.defineExtension({
  result: {
    team: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${APP_URL}/invite/team/${invitationCode}`;
        },
      },
    },
  },
});
