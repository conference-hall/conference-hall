import { InvitationLink } from './InvitationLink';

describe('InvitationLink', () => {
  it('builds an invitation link', () => {
    const link = InvitationLink.build('proposal', 'CODE_INVITE');
    expect(link).toEqual('http://localhost:3001/invite/proposal/CODE_INVITE');
  });
});
