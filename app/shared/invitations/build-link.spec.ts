import { buildInvitationLink } from './build-link.server';

describe('#buildInvitationLink', () => {
  it('builds the invitation link from the invitation token', () => {
    const link = buildInvitationLink('CODE_INVITE');
    expect(link).toEqual('http://localhost:3001/invitation/CODE_INVITE');
  });

  it('returns undefined if no invitation token given', () => {
    const link = buildInvitationLink();
    expect(link).toBeUndefined();
  });
});
