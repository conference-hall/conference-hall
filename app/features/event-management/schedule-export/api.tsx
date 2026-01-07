import {
  AuthorizedApiEventContext,
  requireAuthorizedApiEvent,
} from '~/shared/authorization/authorization.middleware.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
import type { Route } from './+types/api.ts';
import { EventScheduleExport } from './services/schedule-export.server.ts';

export const middleware = [requireAuthorizedApiEvent];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedApiEvent = context.get(AuthorizedApiEventContext);

  const stream = await EventScheduleExport.forApi(authorizedApiEvent).toJsonStream();
  if (!stream) throw new NotFoundError(`No schedule found for event "${authorizedApiEvent.event.slug}"`);

  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  });
};
