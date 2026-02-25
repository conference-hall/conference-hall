import { getSharedServerEnv } from '../../servers/environment.server.ts';
import { Prisma } from '../generated/client.ts';

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
