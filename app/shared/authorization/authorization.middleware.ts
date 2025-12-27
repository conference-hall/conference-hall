import { createContext, type MiddlewareFunction } from 'react-router';
import { getRequiredAuthUser } from '../auth/auth.middleware.ts';
import { BadRequestError } from '../errors.server.ts';
import { checkEventAuthorizations, checkTeamAuthorizations } from './authorization.server.ts';
import type { AuthorizedEvent, AuthorizedTeam } from './types.ts';

// Team authorizations
export const AuthorizedTeamContext = createContext<AuthorizedTeam>();

export const requireAuthorizedTeam: MiddlewareFunction<Response> = async ({ params, context }) => {
  const user = getRequiredAuthUser(context);
  if (!params?.team) throw new BadRequestError('Team authorization must be defined on a `/team/:team` route.');

  const teamAuthContext = await checkTeamAuthorizations(user.id, params.team);
  context.set(AuthorizedTeamContext, teamAuthContext);
};

// Event authorizations
export const AuthorizedEventContext = createContext<AuthorizedEvent>();

export const requireAuthorizedEvent: MiddlewareFunction<Response> = async ({ params, context }) => {
  const user = getRequiredAuthUser(context);

  if (!params?.team || !params?.event)
    throw new BadRequestError('Event authorization must be defined on a `/team/:team/:event` route.');

  const eventAuthContext = await checkEventAuthorizations(user.id, params.team, params.event);
  context.set(AuthorizedEventContext, eventAuthContext);
};
