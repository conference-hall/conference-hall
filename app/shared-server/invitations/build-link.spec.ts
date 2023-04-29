import { buildInvitationLink } from './build-link.server';

describe('#buildInvitationLink', () => {
  it('builds the invitation link from the invitation token', () => {
    const link = buildInvitationLink('CODE_INVITE');
    expect(link).toEqual('http://localhost:3001/invitation/CODE_INVITE');
  });
});
