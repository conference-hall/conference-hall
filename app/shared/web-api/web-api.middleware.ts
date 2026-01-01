import { parseWithZod } from '@conform-to/zod/v4';
import { db } from 'prisma/db.server.ts';
import type { Event } from 'prisma/generated/client.ts';
import { createContext, type MiddlewareFunction } from 'react-router';
import { z } from 'zod';
import {
  ApiKeyInvalidError,
  ApiKeyQueryParamsDeprecatedError,
  EventNotFoundError,
  ForbiddenError,
} from '../errors.server.ts';
import { flags } from '../feature-flags/flags.server.ts';

const API_KEY_SCHEMA = z.object({ key: z.string() });

export const WebApiAuthContext = createContext<Event>();

export const webApiAuth: MiddlewareFunction<Response> = async ({ request, params, context }) => {
  const disableQueryParams = await flags.get('disableApiKeyInQueryParams');

  let apiKey: string | null = null;

  const headerApiKey = request.headers.get('X-API-Key');
  if (headerApiKey) {
    apiKey = headerApiKey;
  } else {
    const url = new URL(request.url);
    const result = parseWithZod(url.searchParams, { schema: API_KEY_SCHEMA });

    if (result.status === 'success') {
      if (disableQueryParams) {
        throw new ApiKeyQueryParamsDeprecatedError();
      }
      apiKey = result.value.key;
    }
  }

  if (!apiKey) throw new ForbiddenError('API key is required');

  const eventSlug = params.event;
  if (!eventSlug) throw new EventNotFoundError();

  const event = await db.event.findUnique({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();
  if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

  context.set(WebApiAuthContext, event);
};
