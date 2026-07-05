import type { FastifyInstance } from 'fastify';

// /clean-urls/ -> /clean-urls
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
