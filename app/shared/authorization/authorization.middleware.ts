import { createContext, type MiddlewareFunction } from 'react-router';
import { getRequiredAuthUser } from '../auth/auth.middleware.ts';
import { BadRequestError } from '../errors.server.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from './authorization.server.ts';
import type { AuthorizedEvent, AuthorizedTeam } from './types.ts';

// Team authorizations
export const AuthorizedTeamContext = createContext<AuthorizedTeam>();

export const requireAuthorizedTeam: MiddlewareFunction<Response> = async ({ params, context }) => {
  const user = getRequiredAuthUser(context);
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
