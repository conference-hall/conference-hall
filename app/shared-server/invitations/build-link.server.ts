import { config } from '~/libs/config';

export function buildInvitationLink(invitationCode: string) {
  return `${config.appUrl}/invitation/${invitationCode}`;
}
