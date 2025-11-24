import type { createContext } from 'react-router';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { authMiddleware, getAuthUser, getRequiredAuthUser, requiredAuthMiddleware } from './auth.middleware.ts';
import { destroySession, getAuthSession } from './session.ts';

vi.mock('./session.ts', () => ({
  getAuthSession: vi.fn(),
  destroySession: vi.fn(),
}));

const getAuthSessionMock = getAuthSession as Mock;
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

describe('authMiddleware', () => {
  it('sets authenticated user in context when session is valid', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getAuthSessionMock.mockResolvedValue({ userId: user.id, uid: user.uid });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthSessionMock).toHaveBeenCalledWith(request);
    expect(getAuthUser(context)).toEqual({
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
    getAuthSessionMock.mockResolvedValue(null);
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthSessionMock).toHaveBeenCalledWith(request);
    expect(getAuthUser(context)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });

  it('sets null in context when user is not found', async () => {
    getAuthSessionMock.mockResolvedValue({ userId: 'user-123', uid: null });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthSessionMock).toHaveBeenCalledWith(request);
    expect(getAuthUser(context)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });

  it('destroys session when uid exists but user is not found', async () => {
    getAuthSessionMock.mockResolvedValue({ userId: 'user-123', uid: 'uid-123' });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(destroySessionMock).toHaveBeenCalledWith(request);
  });

  it('sets null in context when session has no uid', async () => {
    getAuthSessionMock.mockResolvedValue({ userId: 'user-123', uid: null });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthUser(context)).toBeNull();
    expect(destroySessionMock).not.toHaveBeenCalled();
  });
});

describe('getAuthUser', () => {
  it('returns authenticated user from context', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getAuthSessionMock.mockResolvedValue({ userId: user.id, uid: user.uid });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthUser(context)).toEqual({
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
});

describe('requiredAuthMiddleware', () => {
  it('sets user in protected context when authenticated', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getAuthSessionMock.mockResolvedValue({ userId: user.id, uid: user.uid });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getRequiredAuthUser(context)).toEqual({
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
    getAuthSessionMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/protected/page');
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    await expect(async () => {
      await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow();

    try {
      await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2Fprotected%2Fpage');
    }
  });

  it('preserves redirectTo parameter in login URL', async () => {
    getAuthSessionMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/team/my-team/settings');
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    try {
      await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2Fteam%2Fmy-team%2Fsettings');
    }
  });

  it('redirects with root path when accessing root', async () => {
    getAuthSessionMock.mockResolvedValue(null);
    const request = createMockRequest('https://example.com/');
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    try {
      await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    } catch (error) {
      const response = error as Response;
      expect(response.headers.get('Location')).toBe('/auth/login?redirectTo=%2F');
    }
  });
});

describe('getRequiredAuthUser', () => {
  it('returns authenticated user from protected context', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getAuthSessionMock.mockResolvedValue({ userId: user.id, uid: user.uid });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getRequiredAuthUser(context)).toEqual({
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
});

describe('middleware chain behavior', () => {
  it('works correctly when both middlewares run in sequence', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getAuthSessionMock.mockResolvedValue({ userId: user.id, uid: user.uid });
    const request = createMockRequest();
    const context = createMockContext();

    await authMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getAuthUser(context)).toEqual({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
    expect(getRequiredAuthUser(context)).toEqual({
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
      await requiredAuthMiddleware({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow();
  });
});
