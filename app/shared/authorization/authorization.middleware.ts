import { db } from 'prisma/db.server.ts';
import { createContext, type MiddlewareFunction } from 'react-router';
import { RequireAuthContext } from '../authentication/auth.middleware.ts';
import { BadRequestError, NotFoundError } from '../errors.server.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from './authorization.server.ts';
import type { AuthorizedAdmin, AuthorizedEvent, AuthorizedTeam } from './types.ts';

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
