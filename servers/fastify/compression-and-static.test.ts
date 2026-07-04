import type { FastifyInstance } from 'fastify';
import { createTestServer } from './test-helpers.ts';

describe('compression', { tags: ['no-teardown'] }, () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const bigBody = `<html>${'a'.repeat(2048)}</html>`;
    app = await createTestServer({
      reactRouter: {
        routeOptions: {
          preHandler: async (_request, reply) => {
            return reply.type('text/html').send(bigBody);
          },
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves Brotli to clients that accept it', async () => {
    const response = await app.inject({ method: 'GET', url: '/', headers: { 'accept-encoding': 'br' } });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-encoding']).toBe('br');
  });

  it('falls back to gzip for gzip-only clients', async () => {
    const response = await app.inject({ method: 'GET', url: '/', headers: { 'accept-encoding': 'gzip' } });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
  });

  it('prefers Brotli over gzip when the client accepts several encodings', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: { 'accept-encoding': 'gzip, deflate, br' },
    });

    expect(response.headers['content-encoding']).toBe('br');
  });

  it('keeps small bodies uncompressed', async () => {
    const small = await createTestServer();

    const response = await small.inject({ method: 'GET', url: '/', headers: { 'accept-encoding': 'br, gzip' } });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-encoding']).toBeUndefined();

    await small.close();
  });
});

describe('static assets', { tags: ['no-teardown'] }, () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('caches fingerprinted assets immutably for a year', async () => {
    const response = await app.inject({ method: 'GET', url: '/assets/entry-D3adB33f.js' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('caches fonts immutably for a year', async () => {
    const response = await app.inject({ method: 'GET', url: '/fonts/inter-latin.woff2' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('caches other client build files for an hour', async () => {
    const response = await app.inject({ method: 'GET', url: '/favicon.svg' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=3600');
  });

  it('compresses static assets too', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/assets/entry-D3adB33f.js',
      headers: { 'accept-encoding': 'br' },
    });

    expect(response.headers['content-encoding']).toBe('br');
  });

  it('lets locale requests reach the React Router handler instead of a static mount', async () => {
    const response = await app.inject({ method: 'GET', url: '/locales/en/translation.json' });

    // The catch-all route answers (short-circuited to 'ok' in tests), not @fastify/static
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('ok');
    expect(response.headers['cache-control']).toBeUndefined();
  });
});
