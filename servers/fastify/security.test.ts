import type { FastifyInstance } from 'fastify';
import { createTestServer } from './test-helpers.ts';

describe('security headers', { tags: ['no-teardown'] }, () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sends a report-only CSP with a per-request nonce in script-src', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-security-policy']).toBeUndefined();

    const csp = String(response.headers['content-security-policy-report-only']);
    const scriptSrc = csp.split(';').find((directive) => directive.trim().startsWith('script-src '));
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain('https://challenges.cloudflare.com');
    expect(scriptSrc).toMatch(/'nonce-[a-f0-9]{32}'/);
  });

  it('does not send script-src-elem nor script-src-attr directives', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    const csp = String(response.headers['content-security-policy-report-only']);
    expect(csp).not.toContain('script-src-elem');
    expect(csp).not.toContain('script-src-attr');
  });

  it('appends the nonce to style-src on top of Helmet defaults', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    const csp = String(response.headers['content-security-policy-report-only']);
    const styleSrc = csp.split(';').find((directive) => directive.trim().startsWith('style-src '));
    expect(styleSrc).toContain("'self'");
    expect(styleSrc).toContain('https:');
    expect(styleSrc).toContain("'unsafe-inline'");
    expect(styleSrc).toMatch(/'nonce-[a-f0-9]{32}'/);
  });

  it('generates a fresh nonce for each request', async () => {
    const first = await app.inject({ method: 'GET', url: '/' });
    const second = await app.inject({ method: 'GET', url: '/' });

    const nonceOf = (response: typeof first) =>
      String(response.headers['content-security-policy-report-only']).match(/'nonce-([a-f0-9]{32})'/)?.[1];

    expect(nonceOf(first)).toBeDefined();
    expect(nonceOf(first)).not.toBe(nonceOf(second));
  });

  it('carries the other Helmet security headers', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.headers['referrer-policy']).toBe('same-origin');
    expect(response.headers['cross-origin-embedder-policy']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
});
