import { EventSpeakerSaveSchema } from '@conference-hall/shared/types/speaker.types.ts';
import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/new-speaker.ts';
import { SpeakerForm } from './components/speaker-form.tsx';
import { EventSpeakers } from './services/event-speakers.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
  await eventSpeakers.canCreate();
  return null;
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: EventSpeakerSaveSchema });
  if (result.status !== 'success') return { errors: result.error || null };

  try {
    const speaker = await EventSpeakers.for(userId, params.team, params.event).create(result.value);
    const headers = await toastHeaders('success', i18n.t('event-management.speakers.new.feedbacks.created'));
    return redirect(href('/team/:team/:event/speakers/:speaker', { ...params, speaker: speaker.id }), { headers });
  } catch (error) {
    if (error instanceof SpeakerEmailAlreadyExistsError) {
      return { errors: { email: [i18n.t('event-management.speakers.new.errors.email-already-exists')] } };
    }
    throw error;
  }
};

export default function NewSpeakerRoute({ actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { team } = useCurrentEventTeam();
  const formId = useId();

  if (!team.userPermissions?.canCreateEventSpeaker) {
    return null;
  }

  return (
    <Page>
      <Page.Heading
        title={t('event-management.speakers.new.title')}
        subtitle={t('event-management.speakers.new.subtitle')}
      />

      <Card>
        <Card.Content>
          <SpeakerForm formId={formId} errors={actionData?.errors} />
        </Card.Content>

        <Card.Actions>
          <Button variant="secondary" to={href('/team/:team/:event/speakers', params)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId}>
            {t('event-management.speakers.new.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
