import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleIAGenerateSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import type { Route } from './+types/ai.ts';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const locale = await i18n.getLocale(request);

  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const body = await request.json();
  const result = ScheduleIAGenerateSchema.safeParse(body);

  if (!result.success) return Response.json({ error: result.error.message });

  try {
    const stream = await eventSchedule.generateWithIA(result.data, locale);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message });
    }
    return Response.json({ error: t('error.global') });
  }
};
