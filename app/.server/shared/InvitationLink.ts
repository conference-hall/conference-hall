import { appUrl } from '~/libs/env/env.server';

type InvtationType = 'talk' | 'proposal' | 'team';

export class InvitationLink {
  static build(type: InvtationType, code: string) {
    return `${appUrl()}/invite/${type}/${code}`;
  }
}
