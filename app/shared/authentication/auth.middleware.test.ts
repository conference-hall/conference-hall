import type { createContext } from 'react-router';
import { userFactory } from 'tests/factories/users.ts';
import { OptionalAuthContext, optionalAuth, RequireAuthContext, requireAuth } from './auth.middleware.ts';

vi.mock('../../auth.server.ts', () => ({ auth: { api: { getSession: vi.fn(), signOut: vi.fn() } } }));
const { auth } = await import('../../auth.server.ts');
const getSessionMock = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const signOutMock = auth.api.signOut as unknown as ReturnType<typeof vi.fn>;

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
    const request = createMockRequest();
    const context = createMockContext();
    getSessionMock.mockResolvedValue({ user: { id: user.id } });

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getSessionMock).toHaveBeenCalledWith({ headers: request.headers });
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
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('sets null in context when session is null', async () => {
    getSessionMock.mockResolvedValue(null);
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(getSessionMock).toHaveBeenCalledWith({ headers: request.headers });
    expect(context.get(OptionalAuthContext)).toBeNull();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('signs out and sets null when session exists but user is not found in database', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'non-existent-user-id' } });
    signOutMock.mockResolvedValue(new Response());
    const request = createMockRequest();
    const context = createMockContext();

    await expect(optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext)).rejects.toBeInstanceOf(
      Response,
    );

    expect(signOutMock).toHaveBeenCalledWith({ headers: request.headers });
  });

  it('sets null in context when session has no user id', async () => {
    getSessionMock.mockResolvedValue({ user: { id: undefined } });
    const request = createMockRequest();
    const context = createMockContext();

    await optionalAuth({ request, context, params: {}, unstable_pattern: '' }, mockNext);

    expect(context.get(OptionalAuthContext)).toBeNull();
    expect(signOutMock).not.toHaveBeenCalled();
  });
});

describe('requireAuth middleware', () => {
  it('sets user in protected context when authenticated', async () => {
    const user = await userFactory({ traits: ['clark-kent'] });
    getSessionMock.mockResolvedValue({ user: { id: user.id } });
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
    getSessionMock.mockResolvedValue(null);
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
    getSessionMock.mockResolvedValue(null);
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
    getSessionMock.mockResolvedValue(null);
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
    getSessionMock.mockResolvedValue({ user: { id: user.id } });
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
