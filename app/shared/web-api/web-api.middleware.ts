import { parseWithZod } from '@conform-to/zod/v4';
import { db } from 'prisma/db.server.ts';
import type { Event } from 'prisma/generated/client.ts';
import { createContext, type MiddlewareFunction, type RouterContextProvider } from 'react-router';
import { z } from 'zod';
import { ApiKeyInvalidError, EventNotFoundError, ForbiddenError } from '../errors.server.ts';

const API_KEY_SCHEMA = z.object({ key: z.string() });

const webApiContext = createContext<Event>();

export const webApiMiddleware: MiddlewareFunction<Response> = async ({ request, params, context }) => {
  const url = new URL(request.url);
  const result = parseWithZod(url.searchParams, { schema: API_KEY_SCHEMA });

  if (result.status !== 'success') throw new ForbiddenError('API key is required');

  const eventSlug = params.event;
  if (!eventSlug) throw new EventNotFoundError();

  const event = await db.event.findUnique({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();
  if (event.apiKey !== result.value.key) throw new ApiKeyInvalidError();

  context.set(webApiContext, event);
};

export function getWebApiEvent(context: Readonly<RouterContextProvider>) {
  return context.get(webApiContext);
}
