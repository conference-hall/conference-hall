import { buildInvitationLink } from './build-link.server';

describe('#buildInvitationLink', () => {
  it('builds the invitation link from the invitation token', () => {
    const link = buildInvitationLink('proposal', 'CODE_INVITE');
    expect(link).toEqual('http://localhost:3001/invite/proposal/CODE_INVITE');
  });
});
