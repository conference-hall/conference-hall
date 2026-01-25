import { parseWithZod } from '@conform-to/zod/v4';
import { createContext, type MiddlewareFunction } from 'react-router';
import z from 'zod';
import type { AuthorizedAdmin, AuthorizedApiEvent, AuthorizedEvent, AuthorizedTeam } from './types.ts';
import { db } from '../../../prisma/db.server.ts';
import { RequireAuthContext } from '../authentication/auth.middleware.ts';
import {
  ApiKeyInvalidError,
  ApiKeyQueryParamsDeprecatedError,
  BadRequestError,
  EventNotFoundError,
  ForbiddenError,
  NotFoundError,
} from '../errors.server.ts';
import { flags } from '../feature-flags/flags.server.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from './authorization.server.ts';

// Admin authorizations
export const AuthorizedAdminContext = createContext<AuthorizedAdmin>();

export const requireAdmin: MiddlewareFunction<Response> = async ({ context }) => {
  const user = context.get(RequireAuthContext);
  if (!user) throw new BadRequestError('`requireAdmin` must be defined after `requireAuthUser`');

  const admin = await db.user.findUnique({ where: { id: user.id, admin: true } });
  if (!admin) throw new NotFoundError('Page not found');

  context.set(AuthorizedAdminContext, { id: admin.id });
};

// Team authorizations
export const AuthorizedTeamContext = createContext<AuthorizedTeam>();

export const requireAuthorizedTeam: MiddlewareFunction<Response> = async ({ params, context }) => {
  const user = context.get(RequireAuthContext);
  if (!user) throw new BadRequestError('`requireAuthorizedTeam` must be defined after `requireAuthUser`');
  if (!params?.team) throw new BadRequestError('Team authorization must be defined on a `/team/:team` route.');

  const authorizedTeam = await getAuthorizedTeam(user.id, params.team);
  context.set(AuthorizedTeamContext, authorizedTeam);
};

// Event authorizations
export const AuthorizedEventContext = createContext<AuthorizedEvent>();

export const requireAuthorizedEvent: MiddlewareFunction<Response> = async ({ params, context }) => {
  const authorizedTeam = context.get(AuthorizedTeamContext);
  if (!authorizedTeam)
    throw new BadRequestError('`requireAuthorizedEvent` must be defined after `requireAuthorizedTeam`');
  if (!params?.event) throw new BadRequestError('Event authorization must be defined on a `/team/:team/:event` route.');

  const authorizedEvent = await getAuthorizedEvent(authorizedTeam, params.event);
  context.set(AuthorizedEventContext, authorizedEvent);
};

// Web API Event authorizations
export const AuthorizedApiEventContext = createContext<AuthorizedApiEvent>();

export const requireAuthorizedApiEvent: MiddlewareFunction<Response> = async ({ request, params, context }) => {
  const disableQueryParams = await flags.get('disableApiKeyInQueryParams');

  let apiKey: string | null = null;

  const headerApiKey = request.headers.get('X-API-Key');
  if (headerApiKey) {
    apiKey = headerApiKey;
  } else {
    const url = new URL(request.url);
    const result = parseWithZod(url.searchParams, { schema: z.object({ key: z.string() }) });

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

  context.set(AuthorizedApiEventContext, { event });
};
