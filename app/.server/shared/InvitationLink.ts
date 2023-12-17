import { config } from '~/libs/config.server';

type InvtationType = 'talk' | 'proposal' | 'team';

export class InvitationLink {
  static build(type: InvtationType, code: string) {
    return `${config.appUrl}/invite/${type}/${code}`;
  }
}
