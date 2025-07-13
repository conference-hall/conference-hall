import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod/v4';
import { ForbiddenError } from '~/shared/errors.server.ts';
import type { Route } from './+types/schedule-api.ts';
import { EventScheduleApi } from './services/schedule-api.server.ts';

const API_KEY_SCHEMA = z.object({ key: z.string() });

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const result = parseWithZod(url.searchParams, { schema: API_KEY_SCHEMA });

  if (result.status !== 'success') throw new ForbiddenError('API key is required');

  const schedule = await EventScheduleApi.forJsonApi(params.event, result.value.key);
  return Response.json(schedule);
};
