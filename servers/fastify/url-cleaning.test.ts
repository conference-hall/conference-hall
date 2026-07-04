import type { FastifyInstance } from 'fastify';
import { createTestServer } from './test-helpers.ts';

describe('url cleaning', { tags: ['no-teardown'] }, () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer({ rateLimits: { maxMultiple: 1 } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('redirects trailing-slash paths to the clean path with a 301', async () => {
    const response = await app.inject({ method: 'GET', url: '/speaker/talks/' });

    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('/speaker/talks');
  });

  it('preserves the query string in the redirect', async () => {
    const response = await app.inject({ method: 'GET', url: '/speaker/talks/?page=2&sort=asc' });

    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('/speaker/talks?page=2&sort=asc');
  });

  it('collapses duplicate slashes in the redirect (chained until clean)', async () => {
    const response = await app.inject({ method: 'GET', url: '/speaker//talks//' });

    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('/speaker/talks/');

    const followed = await app.inject({ method: 'GET', url: String(response.headers.location) });

    expect(followed.statusCode).toBe(301);
    expect(followed.headers.location).toBe('/speaker/talks');
  });

  it('does not redirect the root path', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(200);
  });

  it('does not redirect clean paths', async () => {
    const response = await app.inject({ method: 'GET', url: '/speaker/talks?page=2' });

    expect(response.statusCode).toBe(200);
  });

  it('redirects before rate limiting, without consuming a rate-limit token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/event/my-event/' });

    expect(response.statusCode).toBe(301);
    expect(response.headers['ratelimit-remaining']).toBeUndefined();

    const followed = await app.inject({ method: 'GET', url: '/api/v1/event/my-event' });
    expect(followed.statusCode).toBe(200);
    expect(followed.headers['ratelimit-remaining']).toBe('59');
  });
});
