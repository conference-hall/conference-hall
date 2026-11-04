import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect, useNavigation } from 'react-router';
import { z } from 'zod';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { EventSpeakerInvitations } from '~/features/event-management/speakers/services/event-speaker-invitations.server.ts';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import { InvitationInvalidOrAccepted, SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/speaker-invitation.ts';

export const middleware = [requireAuth];

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const user = context.get(RequireAuthContext);
  return EventSpeakerInvitations.getForRecipient(params.code, user.id);
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const user = context.get(RequireAuthContext);
  const i18n = getI18n(context);
  const result = parseWithZod(await request.formData(), {
    schema: z.object({ intent: z.enum(['accept', 'decline']) }),
  });
  if (result.status !== 'success') throw new InvitationInvalidOrAccepted();

  try {
    const { eventSlug } = await EventSpeakerInvitations.respond(params.code, user.id, result.value.intent);
    const accepted = result.value.intent === 'accept';
    const message = accepted
      ? i18n.t('speaker.event-invitation.accepted')
      : i18n.t('speaker.event-invitation.declined');
    return redirect(accepted ? href('/:event', { event: eventSlug }) : href('/speaker'), {
      headers: await toastHeaders('success', message),
    });
  } catch (error) {
    if (error instanceof SpeakerEmailAlreadyExistsError) {
      return { error: i18n.t('speaker.event-invitation.email-conflict') };
    }
    if (error instanceof InvitationInvalidOrAccepted) {
      return { error: i18n.t('speaker.event-invitation.unavailable') };
    }
    throw error;
  }
};

export default function SpeakerInvitationRoute({ loaderData: invitation, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';

  return (
    <FullscreenPage compact>
      <FullscreenPage.Title title={t('speaker.event-invitation.title')} />
      {!invitation ? (
        <Callout>{t('speaker.event-invitation.unavailable')}</Callout>
      ) : (
        <Card>
          <Card.Content className="space-y-5">
            <H2 size="l">{invitation.event.name}</H2>
            <Text>
              {t('speaker.event-invitation.introduction', {
                organizerName: invitation.invitedBy?.name || invitation.event.team.name,
                teamName: invitation.event.team.name,
                eventName: invitation.event.name,
                interpolation: { escapeValue: false },
              })}
            </Text>
            {invitation.message ? (
              <div className="space-y-2 rounded-md bg-gray-50 p-4">
                <H2 size="s">{t('speaker.event-invitation.message')}</H2>
                <Text className="break-words whitespace-pre-wrap">{invitation.message}</Text>
              </div>
            ) : null}
            <Text>{t('speaker.event-invitation.consent')}</Text>
            <Text variant="secondary" size="s">
              {t('speaker.event-invitation.profile-updates')}
            </Text>
            {actionData?.error ? (
              <Callout variant="error" role="alert">
                {actionData.error}
              </Callout>
            ) : null}
          </Card.Content>
          <Card.Actions>
            <Form method="POST" className="flex gap-2">
              <Button type="submit" name="intent" value="decline" variant="secondary" disabled={submitting}>
                {t('speaker.event-invitation.decline')}
              </Button>
              <Button type="submit" name="intent" value="accept" disabled={submitting}>
                {t('common.accept-invitation')}
              </Button>
            </Form>
          </Card.Actions>
        </Card>
      )}
    </FullscreenPage>
  );
}
