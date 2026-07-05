import type { FastifyInstance } from 'fastify';
import { flags } from '../../app/shared/feature-flags/flags.server.ts';

// While the seo feature flag is disabled, keep search engines away from every page.
// The flag is checked once at startup: changing it requires a server restart.
export async function applySeoHeader(app: FastifyInstance) {
  const isSeoEnabled = await flags.get('seo');

  if (isSeoEnabled) return;

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('x-robots-tag', 'noindex, nofollow');
  });
}
