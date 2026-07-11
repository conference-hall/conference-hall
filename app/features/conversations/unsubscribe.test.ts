import { userFactory } from 'tests/factories/users.ts';
import { db } from '~/../prisma/db.server.ts';
import { generateUnsubscribeToken } from './services/unsubscribe-token.server.ts';
import { loader } from './unsubscribe.tsx';

function loaderArgs(token: string) {
  return { request: new Request(`http://localhost/unsubscribe?token=${encodeURIComponent(token)}`) } as Parameters<
    typeof loader
  >[0];
}

describe('unsubscribe loader', () => {
  it('flips the digest preference off for a valid token', async () => {
    const user = await userFactory();

    const result = await loader(loaderArgs(generateUnsubscribeToken(user.id)));

    expect(result).toEqual({ success: true });
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.conversationDigestEnabled).toBe(false);
  });

  it('changes nothing for an invalid token', async () => {
    const user = await userFactory();

    const result = await loader(loaderArgs('garbage-token'));

    expect(result).toEqual({ success: false });
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.conversationDigestEnabled).toBe(true);
  });
});
