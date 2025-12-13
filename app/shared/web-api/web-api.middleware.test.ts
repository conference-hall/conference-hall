import type { createContext } from 'react-router';
import { eventFactory } from 'tests/factories/events.ts';
import { ApiKeyInvalidError, EventNotFoundError, ForbiddenError } from '../errors.server.ts';
import { getWebApiEvent, webApiMiddleware } from './web-api.middleware.ts';

function createMockContext() {
  const store = new Map();
  return {
    get: (key: ReturnType<typeof createContext>) => store.get(key),
    set: (key: ReturnType<typeof createContext>, value: unknown) => store.set(key, value),
  };
}

const mockNext = vi.fn(async () => new Response());

describe('webApiMiddleware', () => {
  it('sets event in context when API key is valid', async () => {
    const event = await eventFactory({ attributes: { apiKey: 'valid-api-key', slug: 'test-event' } });
    const request = new Request('https://example.com/api/test?key=valid-api-key');
    const context = createMockContext();
    const params = { event: 'test-event' };

    await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);

    const contextEvent = getWebApiEvent(context);
    expect(contextEvent?.id).toBe(event.id);
    expect(contextEvent?.slug).toBe('test-event');
    expect(contextEvent?.apiKey).toBe('valid-api-key');
  });

  it('throws ForbiddenError when API key query parameter is missing', async () => {
    const request = new Request('https://example.com/api/test');
    const context = createMockContext();
    const params = { event: 'test-event' };

    await expect(webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('throws EventNotFoundError when event slug is not in params', async () => {
    const request = new Request('https://example.com/api/test?key=some-key');
    const context = createMockContext();
    const params = {};

    await expect(async () => {
      await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow(EventNotFoundError);
  });

  it('throws EventNotFoundError when event does not exist', async () => {
    const request = new Request('https://example.com/api/test?key=valid-api-key');
    const context = createMockContext();
    const params = { event: 'non-existent-event' };

    await expect(async () => {
      await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow(EventNotFoundError);
  });

  it('throws ApiKeyInvalidError when API key does not match', async () => {
    await eventFactory({ attributes: { apiKey: 'correct-key', slug: 'test-event' } });
    const request = new Request('https://example.com/api/test?key=wrong-key');
    const context = createMockContext();
    const params = { event: 'test-event' };

    await expect(async () => {
      await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow(ApiKeyInvalidError);
  });

  it('validates API key from query string correctly', async () => {
    await eventFactory({ attributes: { apiKey: 'my-secret-key-123', slug: 'my-event' } });
    const request = new Request('https://example.com/api/v1/proposals?key=my-secret-key-123&filter=accepted');
    const context = createMockContext();
    const params = { event: 'my-event' };

    await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);

    const contextEvent = getWebApiEvent(context);
    expect(contextEvent?.slug).toBe('my-event');
  });
});

describe('getWebApiEvent', () => {
  it('returns event from context', async () => {
    const event = await eventFactory({ attributes: { apiKey: 'test-key', slug: 'test-event' } });
    const request = new Request('https://example.com/api/test?key=test-key');
    const context = createMockContext();
    const params = { event: 'test-event' };

    await webApiMiddleware({ request, context, params, unstable_pattern: '' }, mockNext);

    const contextEvent = getWebApiEvent(context);
    expect(contextEvent?.id).toBe(event.id);
    expect(contextEvent?.slug).toBe('test-event');
  });
});
