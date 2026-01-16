import type { createContext } from 'react-router';
import type { Mock } from 'vitest';
import { userFactory } from 'tests/factories/users.ts';
import { OptionalAuthContext, optionalAuth, RequireAuthContext, requireAuth } from './auth.middleware.ts';
import { destroySession, getSessionUid } from './session.ts';

vi.mock('./session.ts', () => ({
  getSessionUid: vi.fn(),
  destroySession: vi.fn(),
}));

const getSessionUidMock = getSessionUid as Mock;
const destroySessionMock = destroySession as Mock;

function createMockContext() {
  const store = new Map();
  return {
    get: (key: ReturnType<typeof createContext>) => store.get(key),
    set: (key: ReturnType<typeof createContext>, value: unknown) => store.set(key, value),
  };
}

function createMockRequest(url = 'https://example.com/test') {
  return new Request(url);
}

const mockNext = vi.fn(async () => new Response());

describe('optionalAuth middleware', () => {
  it('sets authenticated user in context when session is valid', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getSessionUidMock.mockResolvedValue(user.uid);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getSessionUidMock).toHaveBeenCalledWith(request);
    expect(context.get(OptionalAuthContext)).toEqual({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
    expect(destroySessionMock).not.toHaveBeenCalled();
  });

  it('sets null in context when session is null', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getSessionUidMock).toHaveBeenCalledWith(request);
    expect(context.get(OptionalAuthContext)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });

  it('sets null in context when user is not found', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getSessionUidMock).toHaveBeenCalledWith(request);
    expect(context.get(OptionalAuthContext)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });

  it('destroys session when uid exists but user is not found', async () => {
    getSessionUidMock.mockResolvedValue('uid-123');
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(destroySessionMock).toHaveBeenCalledWith(request);
  });

  it('sets null in context when session has no uid', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(context.get(OptionalAuthContext)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });
});

describe('requireAuth middleware', () => {
  it('sets user in protected context when authenticated', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getSessionUidMock.mockResolvedValue(user.uid);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(context.get(RequireAuthContext)).toEqual({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
  });

  it('redirects to login when user is not authenticated', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/protected/page');
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    await expect(async () => {
      await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow(Response);

    try {
      await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2Fprotected%2Fpage');
    }
  });

  it('preserves redirectTo parameter in login URL', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/team/my-team/settings');
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    try {
      await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2Fteam%2Fmy-team%2Fsettings');
    }
  });

  it('redirects with root path when accessing root', async () => {
    getSessionUidMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/');
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    try {
      await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2F');
    }
  });
});

describe('middleware chain behavior', () => {
  it('works correctly when both middlewares run in sequence', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getSessionUidMock.mockResolvedValue(user.uid);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(context.get(OptionalAuthContext)).toEqual({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
    expect(context.get(RequireAuthContext)).toEqual({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
  });

  it('requiredAuthMiddleware fails when authMiddleware has not run', async () => {
    const request = createMockRequest();
    const context = createMockContext();

    await expect(async () => {
      await requireAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow();
  });
});
