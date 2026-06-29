import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSharedServerEnv } from '../../../../servers/environment.server.ts';

const { COOKIE_SIGNED_SECRET } = getSharedServerEnv();

// Stateless one-click unsubscribe token: an HMAC of the user id signed with the app secret. No token
// column, not enumerable, and verifiable from the unauthenticated route. Shared by the digest job
// (generation) and the `/unsubscribe` route (verification).
function sign(userId: string): string {
  return createHmac('sha256', COOKIE_SIGNED_SECRET).update(userId).digest('base64url');
}

export function generateUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const userId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(userId);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  return userId;
}
