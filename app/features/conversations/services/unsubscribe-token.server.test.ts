import { generateUnsubscribeToken, verifyUnsubscribeToken } from './unsubscribe-token.server.ts';

describe('unsubscribe token', () => {
  it('verifies a freshly generated token and returns the user id', () => {
    const token = generateUnsubscribeToken('user-1');
    expect(verifyUnsubscribeToken(token)).toBe('user-1');
  });

  it('rejects a tampered token', () => {
    const token = generateUnsubscribeToken('user-1');
    expect(verifyUnsubscribeToken(`${token}tampered`)).toBeNull();
  });

  it('rejects a token forged for a different user id', () => {
    const token = generateUnsubscribeToken('user-1');
    const signature = token.split('.')[1];
    expect(verifyUnsubscribeToken(`user-2.${signature}`)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyUnsubscribeToken('')).toBeNull();
    expect(verifyUnsubscribeToken('no-signature')).toBeNull();
    expect(verifyUnsubscribeToken('.signature-only')).toBeNull();
  });
});
