import { config } from '~/libs/config';

type InvitationType = 'talk' | 'proposal' | 'team';

export function buildInvitationLink(type: InvitationType, code: string) {
  return `${config.appUrl}/invite/${type}/${code}`;
}
