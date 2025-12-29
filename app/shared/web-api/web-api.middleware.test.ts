import type { createContext } from 'react-router';
import { eventFactory } from 'tests/factories/events.ts';
import {
  ApiKeyInvalidError,
  ApiKeyQueryParamsDeprecatedError,
  EventNotFoundError,
  ForbiddenError,
} from '../errors.server.ts';
import { flags } from '../feature-flags/flags.server.ts';
import { WebApiAuthContext, webApiAuth } from './web-api.middleware.ts';

function createMockContext() {
  const store = new Map();
  return {
    get: (key: ReturnType<typeof createContext>) => store.get(key),
    set: (key: ReturnType<typeof createContext>, value: unknown) => store.set(key, value),
  };
}

const mockNext = vi.fn(async () => new Response());

describe('webApiAuth middleware', () => {
  describe('header-based authentication', () => {
    it('sets event in context when API key is valid in header', async () => {
      const event = await eventFactory({ attributes: { apiKey: 'valid-api-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test', {
        headers: { 'X-API-Key': 'valid-api-key' },
      });
      const context = createMockContext();
      const params = { event: 'test-event' };

      await webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext);

      const contextEvent = context.get(WebApiAuthContext);
      expect(contextEvent?.id).toBe(event.id);
      expect(contextEvent?.slug).toBe('test-event');
      expect(contextEvent?.apiKey).toBe('valid-api-key');
    });

    it('throws ApiKeyInvalidError when header API key does not match', async () => {
      await eventFactory({ attributes: { apiKey: 'correct-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test', {
        headers: { 'X-API-Key': 'wrong-key' },
      });
      const context = createMockContext();
      const params = { event: 'test-event' };

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        ApiKeyInvalidError,
      );
    });

    it('prefers header API key over query params', async () => {
      const event = await eventFactory({ attributes: { apiKey: 'header-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test?key=query-key', {
        headers: { 'X-API-Key': 'header-key' },
      });
      const context = createMockContext();
      const params = { event: 'test-event' };

      await webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext);

      const contextEvent = context.get(WebApiAuthContext);
      expect(contextEvent?.id).toBe(event.id);
    });
  });

  describe('query params authentication (backward compatibility)', () => {
    it('sets event in context when API key is valid in query params', async () => {
      const event = await eventFactory({ attributes: { apiKey: 'valid-api-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test?key=valid-api-key');
      const context = createMockContext();
      const params = { event: 'test-event' };

      await webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext);

      const contextEvent = context.get(WebApiAuthContext);
      expect(contextEvent?.id).toBe(event.id);
      expect(contextEvent?.slug).toBe('test-event');
      expect(contextEvent?.apiKey).toBe('valid-api-key');
    });

    it('validates API key from query string correctly', async () => {
      await eventFactory({ attributes: { apiKey: 'my-secret-key-123', slug: 'my-event' } });
      const request = new Request('https://example.com/api/v1/proposals?key=my-secret-key-123&filter=accepted');
      const context = createMockContext();
      const params = { event: 'my-event' };

      await webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext);

      const contextEvent = context.get(WebApiAuthContext);
      expect(contextEvent?.slug).toBe('my-event');
    });

    it('throws ApiKeyQueryParamsDeprecatedError when query params are disabled', async () => {
      await flags.set('disableApiKeyInQueryParams', true);
      await eventFactory({ attributes: { apiKey: 'valid-api-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test?key=valid-api-key');
      const context = createMockContext();
      const params = { event: 'test-event' };

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        ApiKeyQueryParamsDeprecatedError,
      );

      await flags.set('disableApiKeyInQueryParams', false);
    });

    it('allows header authentication when query params are disabled', async () => {
      await flags.set('disableApiKeyInQueryParams', true);
      const event = await eventFactory({ attributes: { apiKey: 'valid-api-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test', {
        headers: { 'X-API-Key': 'valid-api-key' },
      });
      const context = createMockContext();
      const params = { event: 'test-event' };

      await webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext);

      const contextEvent = context.get(WebApiAuthContext);
      expect(contextEvent?.id).toBe(event.id);

      await flags.set('disableApiKeyInQueryParams', false);
    });
  });

  describe('error handling', () => {
    it('throws ForbiddenError when API key query parameter is missing', async () => {
      const request = new Request('https://example.com/api/test');
      const context = createMockContext();
      const params = { event: 'test-event' };

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('throws EventNotFoundError when event slug is not in params', async () => {
      const request = new Request('https://example.com/api/test?key=some-key');
      const context = createMockContext();
      const params = {};

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        EventNotFoundError,
      );
    });

    it('throws EventNotFoundError when event does not exist', async () => {
      const request = new Request('https://example.com/api/test?key=valid-api-key');
      const context = createMockContext();
      const params = { event: 'non-existent-event' };

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        EventNotFoundError,
      );
    });

    it('throws ApiKeyInvalidError when API key does not match', async () => {
      await eventFactory({ attributes: { apiKey: 'correct-key', slug: 'test-event' } });
      const request = new Request('https://example.com/api/test?key=wrong-key');
      const context = createMockContext();
      const params = { event: 'test-event' };

      await expect(webApiAuth({ request, context, params, unstable_pattern: '' }, mockNext)).rejects.toThrow(
        ApiKeyInvalidError,
      );
    });
  });
});
