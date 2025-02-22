import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ForbiddenError } from '~/libs/errors.server.ts';
import type { Route } from './+types/v1.event.$event.ts';

const API_KEY_SCHEMA = z.object({ key: z.string() });

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const result = parseWithZod(url.searchParams, { schema: API_KEY_SCHEMA });

  if (result.status !== 'success') throw new ForbiddenError('API key is required');

  const schedule = await EventSchedule.forJsonApi(params.event, result.value.key);
  return Response.json(schedule);
};
