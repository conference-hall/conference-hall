import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { NotFoundError, SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import { EventSpeakerSaveSchema } from '~/shared/types/speaker.types.ts';
import type { Route } from './+types/edit-speaker.ts';
import { SpeakerTitle } from './components/speaker-details/speaker-title.tsx';
import { SpeakerForm } from './components/speaker-form.tsx';
import { EventSpeakers } from './services/event-speakers.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
  const speaker = await eventSpeakers.getById(params.speaker);

  if (!speaker) throw new NotFoundError('Speaker not found');

  return { speaker };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: EventSpeakerSaveSchema });
  if (result.status !== 'success') return { errors: result.error || null };

  try {
    const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
    await eventSpeakers.update(params.speaker, result.value);
    const headers = await toastHeaders('success', i18n.t('event-management.speakers.edit.feedbacks.updated'));
    return redirect(href('/team/:team/:event/speakers/:speaker', params), { headers });
  } catch (error) {
    if (error instanceof SpeakerEmailAlreadyExistsError) {
      return { errors: { email: [i18n.t('event-management.speakers.new.errors.email-already-exists')] } };
    }
    throw error;
  }
};

export default function EditSpeakerRoute({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team } = useCurrentEventTeam();
  const formId = useId();
  const { speaker } = loaderData;

  if (!isFeatureEnabled || !team.userPermissions?.canEditEventSpeaker) {
    return null;
  }

  const defaultValues = {
    name: speaker.name,
    email: speaker.email,
    picture: speaker.picture || '',
    company: speaker.company || '',
    location: speaker.location || '',
    bio: speaker.bio || '',
    references: speaker.references || '',
    socialLinks: speaker.socialLinks || [],
  };

  return (
    <Page>
      <h1 className="sr-only">{t('event-management.speakers.edit.title', { name: speaker.name })}</h1>
      <Page.Heading
        component={<SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />}
        backTo={href('/team/:team/:event/speakers/:speaker', params)}
      />

      <Card>
        <Card.Content>
          <SpeakerForm formId={formId} defaultValues={defaultValues} errors={actionData?.errors} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink variant="secondary" to={href('/team/:team/:event/speakers/:speaker', params)}>
            {t('common.cancel')}
          </ButtonLink>
          <Button type="submit" form={formId}>
            {t('event-management.speakers.edit.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
