import { isIPv4, isIPv6 } from 'node:net';
import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { href } from 'react-router';
import { getSharedServerEnv } from '../environment.server.ts';

const { NODE_ENV } = getSharedServerEnv();

// Disable rate limiting on dev and test environments
const defaultMaxMultiple = NODE_ENV === 'production' ? 1 : 10_000;

export type RateLimitsOptions = {
  // Multiplier applied to every bucket max, used by tests to re-enable throttling
  maxMultiple?: number;
};

const keyGenerator = (request: FastifyRequest) => {
  // Malicious users can spoof their IP address which means we should not default
  // to trusting request.ip. However, users cannot spoof Cloudflare cf-connecting-ip
  const header = request.headers['cf-connecting-ip'];
  const ip = (Array.isArray(header) ? header[0] : header) ?? request.ip;
  return ipKeyGenerator(ip);
};

const securedPaths = [href('/speaker/settings'), href('/admin')];

export async function applyRateLimits(app: FastifyInstance, options: RateLimitsOptions = {}) {
  const maxMultiple = options.maxMultiple ?? defaultMaxMultiple;

  await app.register(fastifyRateLimit, { global: false, enableDraftSpec: true });

  // Each limiter gets its own store (`store.child()`), so the three buckets keep independent counters
  const apiRateLimit = app.rateLimit({
    timeWindow: 60 * 60 * 1000, // 1 hour
    max: 60 * maxMultiple,
    keyGenerator,
  });

  const strongRateLimit = app.rateLimit({
    timeWindow: 60 * 1000, // 1 minute
    max: 10 * maxMultiple,
    keyGenerator,
  });

  const teamRequestRateLimit = app.rateLimit({
    timeWindow: 60 * 60 * 1000, // 1 hour
    max: 5 * maxMultiple,
    keyGenerator,
  });

  app.addHook('onRequest', async function rateLimitDispatch(request, reply) {
    const path = request.url.split('?')[0];

    // Rate limit for GET /api/v1/
    if (path.startsWith('/api/v1/')) {
      return apiRateLimit.call(app, request, reply);
    }
    // Rate limit for public team request form
    if (request.method === 'POST' && path === href('/team/request')) {
      return teamRequestRateLimit.call(app, request, reply);
    }
    // Rate limit for secured paths
    if (request.method !== 'GET' && request.method !== 'HEAD' && securedPaths.some((p) => path.includes(p))) {
      return strongRateLimit.call(app, request, reply);
    }
  });
}

// Normalizes IPv6 addresses to their /56 subnet so a single user cannot evade
// limits by rotating addresses within their allocation (equivalent to
// express-rate-limit's ipKeyGenerator). IPv4 addresses are used as-is.
export function ipKeyGenerator(ip: string, subnetPrefix = 56): string {
  if (!isIPv6(ip)) return ip;

  const masked = ipv6ToBigInt(ip) & subnetMask(subnetPrefix);
  return `${formatIpv6(masked)}/${subnetPrefix}`;
}

function subnetMask(prefix: number): bigint {
  return ((1n << BigInt(prefix)) - 1n) << BigInt(128 - prefix);
}

function ipv6ToBigInt(ip: string): bigint {
  const [address] = ip.split('%'); // strip any zone id
  const doubleColon = address.indexOf('::');
  const head = doubleColon === -1 ? address : address.slice(0, doubleColon);
  const tail = doubleColon === -1 ? '' : address.slice(doubleColon + 2);

  const headGroups = expandEmbeddedIpv4(head ? head.split(':') : []);
  const tailGroups = expandEmbeddedIpv4(tail ? tail.split(':') : []);
  const zeros = Array.from({ length: 8 - headGroups.length - tailGroups.length }, () => '0');
  const groups = [...headGroups, ...zeros, ...tailGroups];

  return groups.reduce((accumulator, group) => (accumulator << 16n) | BigInt(Number.parseInt(group, 16)), 0n);
}

// An IPv6 address can end with an embedded IPv4 address (e.g. ::ffff:127.0.0.1),
// which counts as two 16-bit groups
function expandEmbeddedIpv4(groups: string[]): string[] {
  return groups.flatMap((group) => {
    if (!isIPv4(group)) return [group];
    const [a, b, c, d] = group.split('.').map(Number);
    return [((a << 8) | b).toString(16), ((c << 8) | d).toString(16)];
  });
}

function formatIpv6(value: bigint): string {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    groups.push(((value >> BigInt(i * 16)) & 0xffffn).toString(16));
  }
  return groups.join(':');
}
