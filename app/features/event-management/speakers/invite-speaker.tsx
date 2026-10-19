import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect, useNavigation } from 'react-router';
import { z } from 'zod';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import {
  ForbiddenOperationError,
  InvitationInvalidOrAccepted,
  SpeakerEmailAlreadyExistsError,
  SpeakerInvitationAlreadyExistsError,
  SpeakerInvitationDeliveryError,
  UserNotFoundError,
} from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import {
  SPEAKER_INVITATION_MESSAGE_MAX_LENGTH,
  SpeakerInvitationSchema,
} from '~/shared/types/speaker-invitation.types.ts';
import type { Route } from './+types/invite-speaker.ts';
import { EventSpeakerInvitations } from './services/event-speaker-invitations.server.ts';

const FormSchema = z.discriminatedUnion('intent', [
  SpeakerInvitationSchema.extend({ intent: z.literal('invite') }),
  z.object({ intent: z.enum(['resend', 'cancel']), invitationId: z.string().min(1) }),
]);

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  return EventSpeakerInvitations.for(context.get(AuthorizedEventContext)).list(parseUrlPage(url));
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  if (!authorizedEvent.permissions.canCreateEventSpeaker) throw new ForbiddenOperationError();

  const i18n = getI18n(context);
  const result = parseWithZod(await request.formData(), { schema: FormSchema });
  if (result.status !== 'success') return { errors: result.error || null };

  const service = EventSpeakerInvitations.for(authorizedEvent);
  try {
    const data = result.value;
    if (data.intent === 'invite') await service.invite(data);
    if (data.intent === 'resend') await service.resend(data.invitationId);
    if (data.intent === 'cancel') await service.cancel(data.invitationId);

    const message =
      data.intent === 'cancel'
        ? i18n.t('event-management.speakers.invite.feedbacks.canceled')
        : i18n.t('event-management.speakers.invite.feedbacks.sent');
    return redirect(href('/team/:team/:event/speakers/invite', params), {
      headers: await toastHeaders('success', message),
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return { errors: { email: [i18n.t('event-management.speakers.invite.errors.not-found')] } };
    }
    if (error instanceof SpeakerEmailAlreadyExistsError) {
      return { errors: { email: [i18n.t('event-management.speakers.new.errors.email-already-exists')] } };
    }
    if (error instanceof SpeakerInvitationAlreadyExistsError) {
      return { errors: { email: [i18n.t('event-management.speakers.invite.errors.already-invited')] } };
    }
    if (error instanceof SpeakerInvitationDeliveryError) {
      return { errors: { _form: [i18n.t('event-management.speakers.invite.errors.delivery')] } };
    }
    if (error instanceof InvitationInvalidOrAccepted) {
      return { errors: { _form: [i18n.t('event-management.speakers.invite.errors.unavailable')] } };
    }
    throw error;
  }
};

export default function InviteSpeakerRoute({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';
  const { invitations, pagination, total } = loaderData;

  return (
    <Page className="space-y-6">
      <Page.Heading
        title={t('event-management.speakers.invite.title')}
        subtitle={t('event-management.speakers.invite.subtitle')}
      />

      {actionData?.errors?._form ? (
        <Callout variant="error" role="alert">
          {actionData.errors._form}
        </Callout>
      ) : null}

      <Card>
        <Card.Content>
          <Form method="POST" id={formId} className="space-y-6">
            <input type="hidden" name="intent" value="invite" />
            <Input
              name="email"
              type="email"
              label={t('common.email')}
              description={t('event-management.speakers.invite.email-description')}
              error={actionData?.errors?.email}
              required
            />
            <TextArea
              name="message"
              label={t('event-management.speakers.invite.message')}
              description={t('event-management.speakers.invite.message-description', {
                count: SPEAKER_INVITATION_MESSAGE_MAX_LENGTH,
              })}
              error={actionData?.errors?.message}
              maxLength={SPEAKER_INVITATION_MESSAGE_MAX_LENGTH}
              rows={5}
            />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button variant="secondary" to={href('/team/:team/:event/speakers', params)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            {t('event-management.speakers.invite.submit')}
          </Button>
        </Card.Actions>
      </Card>

      {invitations.length > 0 ? (
        <List>
          <List.Header>
            <H2>{t('event-management.speakers.invite.list')}</H2>
          </List.Header>
          <List.Content aria-label={t('event-management.speakers.invite.list')}>
            {invitations.map((invitation) => (
              <List.Row key={invitation.id} className="flex-col justify-between gap-4 p-4 sm:flex-row">
                <div className="min-w-0 space-y-1">
                  <Text weight="medium" className="break-all">
                    {invitation.email}
                  </Text>
                  <Text variant="secondary" size="s">
                    {t(`event-management.speakers.invite.status.${invitation.status}`)}
                  </Text>
                  {invitation.message ? (
                    <Text size="s" className="line-clamp-2 break-words whitespace-pre-wrap">
                      {invitation.message}
                    </Text>
                  ) : null}
                </div>
                {invitation.status === 'PENDING' || invitation.status === 'EXPIRED' ? (
                  <Form method="POST" className="flex shrink-0 gap-2">
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <Button type="submit" name="intent" value="resend" variant="secondary" disabled={submitting}>
                      {t('event-management.speakers.invite.resend')}
                    </Button>
                    <Button type="submit" name="intent" value="cancel" variant="secondary" disabled={submitting}>
                      {t('event-management.speakers.invite.cancel')}
                    </Button>
                  </Form>
                ) : null}
              </List.Row>
            ))}
          </List.Content>
          <List.PaginationFooter current={pagination.current} pages={pagination.total} total={total} />
        </List>
      ) : null}
    </Page>
  );
}
