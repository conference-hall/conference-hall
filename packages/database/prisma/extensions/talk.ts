import { getSharedServerEnv } from '../../../shared/src/environment/environment.ts';
import { Prisma } from '../generated/client.ts';

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
