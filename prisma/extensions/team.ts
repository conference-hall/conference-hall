import { Prisma } from '@prisma/client';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const env = getSharedServerEnv();

export const teamExtension = Prisma.defineExtension({
  result: {
    team: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${env.APP_URL}/invite/team/${invitationCode}`;
        },
      },
    },
  },
});
