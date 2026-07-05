import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../../tests/server-helpers.ts';
import { ipKeyGenerator } from './rate-limit.ts';

describe('rate limits', { tags: ['no-teardown'] }, () => {
  describe('with production limits', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
      app = await createTestServer({ rateLimits: { maxMultiple: 1 } });
    });

    afterEach(async () => {
      await app.close();
    });

    it('limits the API to 60 requests per hour with draft ratelimit headers', async () => {
      const response = await app.inject({ method: 'GET', url: '/api/v1/event/my-event' });

      expect(response.statusCode).toBe(200);
      expect(response.headers['ratelimit-limit']).toBe('60');
      expect(response.headers['ratelimit-remaining']).toBe('59');
      expect(response.headers['ratelimit-reset']).toBe('3600');
    });

    it('limits the team request form to 5 submissions per hour and answers 429 with retry-after', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await app.inject({ method: 'POST', url: '/team/request' });
        expect(response.statusCode).toBe(200);
      }

      const exceeded = await app.inject({ method: 'POST', url: '/team/request' });

      expect(exceeded.statusCode).toBe(429);
      expect(exceeded.headers['retry-after']).toBeDefined();
      expect(exceeded.headers['ratelimit-remaining']).toBe('0');
      expect(exceeded.json().message).toMatch(/Rate limit exceeded/);
    });

    it('limits writes on secured paths to 10 per minute', async () => {
      for (let i = 0; i < 10; i++) {
        const response = await app.inject({ method: 'POST', url: '/speaker/settings/profile' });
        expect(response.statusCode).toBe(200);
      }

      const exceeded = await app.inject({ method: 'POST', url: '/speaker/settings/profile' });
      expect(exceeded.statusCode).toBe(429);

      const read = await app.inject({ method: 'GET', url: '/speaker/settings/profile' });
      expect(read.statusCode).toBe(200);
    });

    it('keeps independent counters across the three buckets', async () => {
      for (let i = 0; i < 6; i++) {
        await app.inject({ method: 'POST', url: '/team/request' });
      }
      const teamRequest = await app.inject({ method: 'POST', url: '/team/request' });
      expect(teamRequest.statusCode).toBe(429);

      const api = await app.inject({ method: 'GET', url: '/api/v1/event/my-event' });
      expect(api.statusCode).toBe(200);
      expect(api.headers['ratelimit-remaining']).toBe('59');

      const secured = await app.inject({ method: 'POST', url: '/admin/users' });
      expect(secured.statusCode).toBe(200);
      expect(secured.headers['ratelimit-remaining']).toBe('9');
    });

    it('does not rate limit other pages', async () => {
      const response = await app.inject({ method: 'GET', url: '/some-page' });

      expect(response.statusCode).toBe(200);
      expect(response.headers['ratelimit-limit']).toBeUndefined();
    });

    it('keys the limit on cf-connecting-ip over the socket address', async () => {
      for (let i = 0; i < 6; i++) {
        await app.inject({ method: 'POST', url: '/team/request', headers: { 'cf-connecting-ip': '203.0.113.1' } });
      }
      const sameClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'cf-connecting-ip': '203.0.113.1' },
      });
      expect(sameClient.statusCode).toBe(429);

      const otherClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'cf-connecting-ip': '203.0.113.2' },
      });
      expect(otherClient.statusCode).toBe(200);
    });

    it('falls back to x-real-ip when cf-connecting-ip is absent', async () => {
      for (let i = 0; i < 6; i++) {
        await app.inject({ method: 'POST', url: '/team/request', headers: { 'x-real-ip': '203.0.113.10' } });
      }
      const sameClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'x-real-ip': '203.0.113.10' },
      });
      expect(sameClient.statusCode).toBe(429);

      const otherClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'x-real-ip': '203.0.113.11' },
      });
      expect(otherClient.statusCode).toBe(200);
    });

    it('prefers cf-connecting-ip over x-real-ip when both are present', async () => {
      for (let i = 0; i < 6; i++) {
        await app.inject({
          method: 'POST',
          url: '/team/request',
          headers: { 'cf-connecting-ip': '203.0.113.20', 'x-real-ip': '203.0.113.99' },
        });
      }
      const sameCfClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'cf-connecting-ip': '203.0.113.20', 'x-real-ip': '198.51.100.1' },
      });
      expect(sameCfClient.statusCode).toBe(429);

      const otherCfClient = await app.inject({
        method: 'POST',
        url: '/team/request',
        headers: { 'cf-connecting-ip': '203.0.113.21', 'x-real-ip': '203.0.113.99' },
      });
      expect(otherCfClient.statusCode).toBe(200);
    });
  });

  it('multiplies limits by 10,000 outside production', async () => {
    const app = await createTestServer();

    const response = await app.inject({ method: 'GET', url: '/api/v1/event/my-event' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['ratelimit-limit']).toBe('600000');

    await app.close();
  });
});

describe('ipKeyGenerator', () => {
  it('returns IPv4 addresses as-is', () => {
    expect(ipKeyGenerator('192.0.2.10')).toBe('192.0.2.10');
  });

  it('normalizes IPv6 addresses in the same /56 to the same key', () => {
    const first = ipKeyGenerator('2001:db8:abcd:1200::1');
    const second = ipKeyGenerator('2001:db8:abcd:12ff:ffff:ffff:ffff:ffff');

    expect(first).toBe('2001:db8:abcd:1200:0:0:0:0/56');
    expect(second).toBe(first);
  });

  it('keeps IPv6 addresses from different /56 subnets apart', () => {
    const first = ipKeyGenerator('2001:db8:abcd:1200::1');
    const second = ipKeyGenerator('2001:db8:abcd:1300::1');

    expect(first).not.toBe(second);
  });

  it('handles compressed and embedded IPv4 notations', () => {
    expect(ipKeyGenerator('::1')).toBe('0:0:0:0:0:0:0:0/56');
    expect(ipKeyGenerator('::ffff:192.0.2.10')).toBe('0:0:0:0:0:0:0:0/56');
    expect(ipKeyGenerator('2001:db8::%eth0')).toBe('2001:db8:0:0:0:0:0:0/56');
  });
});
