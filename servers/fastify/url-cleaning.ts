import type { FastifyInstance } from 'fastify';

// /clean-urls/ -> /clean-urls
// Registered before rate limiting, so a redirected request does not consume a rate-limit token.
export function applyUrlCleaning(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    const path = request.url.split('?')[0];

    if (path.endsWith('/') && path.length > 1) {
      const query = request.url.slice(path.length);
      const safepath = path.slice(0, -1).replace(/\/+/g, '/');
      return reply.redirect(safepath + query, 301);
    }
  });
}
