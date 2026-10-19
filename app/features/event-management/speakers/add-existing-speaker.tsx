import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect, useNavigation } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { ForbiddenOperationError, SpeakerEmailAlreadyExistsError, UserNotFoundError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import { AddExistingSpeakerSchema } from '~/shared/types/speaker.types.ts';
import type { Route } from './+types/add-existing-speaker.ts';
import { EventSpeakers } from './services/event-speakers.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const { permissions } = context.get(AuthorizedEventContext);
  if (!permissions.canCreateEventSpeaker) throw new ForbiddenOperationError();
  return null;
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  if (!authorizedEvent.permissions.canCreateEventSpeaker) throw new ForbiddenOperationError();

  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: AddExistingSpeakerSchema });
  if (result.status !== 'success') return { errors: result.error || null };

  try {
    const speaker = await EventSpeakers.for(authorizedEvent).addExisting(result.value.email);
    const headers = await toastHeaders('success', i18n.t('event-management.speakers.add-existing.feedbacks.added'));
    return redirect(href('/team/:team/:event/speakers/:speaker', { ...params, speaker: speaker.id }), { headers });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return { errors: { email: [i18n.t('event-management.speakers.add-existing.errors.not-found')] } };
    }
    if (error instanceof SpeakerEmailAlreadyExistsError) {
      return { errors: { email: [i18n.t('event-management.speakers.new.errors.email-already-exists')] } };
    }
    throw error;
  }
};

export default function AddExistingSpeakerRoute({ actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';

  return (
    <Page>
      <Page.Heading
        title={t('event-management.speakers.add-existing.title')}
        subtitle={t('event-management.speakers.add-existing.subtitle')}
      />

      <Card>
        <Card.Content>
          <Form method="POST" id={formId}>
            <Input
              name="email"
              type="email"
              label={t('common.email')}
              description={t('event-management.speakers.add-existing.email-description')}
              error={actionData?.errors?.email}
              required
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button variant="secondary" to={href('/team/:team/:event/speakers', params)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            {t('event-management.speakers.add-existing.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
