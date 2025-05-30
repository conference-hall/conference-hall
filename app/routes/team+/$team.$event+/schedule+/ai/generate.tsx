import { parseWithZod } from '@conform-to/zod';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleIAGenerateSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import type { Route } from './+types/generate.ts';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const locale = await i18n.getLocale(request);

  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);
  const form = await request.formData();

  const result = parseWithZod(form, { schema: ScheduleIAGenerateSchema });
  if (result.status !== 'success') return { error: t('error.global'), success: false } as const;

  try {
    const response = await eventSchedule.generateWithIA(result.value, locale);
    return { errors: null, success: true, response } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, success: false } as const;
    }
  }
};
