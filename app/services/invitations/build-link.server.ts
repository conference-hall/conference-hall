import { config } from '../../libs/config';

export function buildInvitationLink(invitationId?: string) {
  if (!invitationId) return;
  return `${config.appUrl}/invitation/${invitationId}`;
}
