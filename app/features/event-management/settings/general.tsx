import { parseWithZod } from '@conform-to/zod/v4';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { DeleteModalButton } from '~/design-system/dialogs/delete-modal.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { EventDetailsForm } from '~/features/event-management/creation/components/event-details-form.tsx';
import { EventForm } from '~/features/event-management/creation/components/event-form.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventDetailsSettingsSchema } from '~/features/event-management/settings/services/event-settings.schema.server.ts';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/general.ts';

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const i18n = getI18n(context);
  const event = EventSettings.for(authUser.id, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'general': {
      const schema = await event.buildGeneralSettingsSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;
      const updated = await event.update(result.value);
      const headers = await toastHeaders('success', i18n.t('event-management.settings.feedbacks.general-saved'));
      return redirect(`/team/${params.team}/${updated.slug}/settings`, { headers });
    }
    case 'details': {
      const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', i18n.t('event-management.settings.feedbacks.details-saved'));
    }
    case 'archive-event': {
      const archived = Boolean(form.get('archived'));
      await event.update({ archived });
      return toast(
        'success',
        archived
          ? i18n.t('event-management.settings.feedbacks.archived')
          : i18n.t('event-management.settings.feedbacks.restored'),
      );
    }
    case 'delete-event': {
      await event.delete();
      const headers = await toastHeaders('success', i18n.t('event-management.settings.feedbacks.deleted'));
      return redirect(`/team/${params.team}`, { headers });
    }
  }
  return null;
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const permissions = useUserTeamPermissions();

  const generalFormId = useId();
  const detailsFormId = useId();

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.menu.general')}</H2>
        </Card.Title>

        <Card.Content>
          <Form id={generalFormId} method="POST" className="space-y-4 lg:space-y-6">
            <EventForm initialValues={event} errors={errors} />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" name="intent" value="general" form={generalFormId}>
            {t('event-management.settings.general.submit')}
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.details.heading')}</H2>
          <Subtitle>{t('event-management.settings.details.description')}</Subtitle>
        </Card.Title>

        <Card.Content>
          <EventDetailsForm
            formId={detailsFormId}
            type={event.type}
            timezone={event.timezone}
            conferenceStart={event.conferenceStart}
            conferenceEnd={event.conferenceEnd}
            onlineEvent={event.onlineEvent}
            location={event.location}
            description={event.description}
            websiteUrl={event.websiteUrl}
            contactEmail={event.contactEmail}
            errors={errors}
          />
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="details" form={detailsFormId}>
            {t('event-management.settings.details.submit')}
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section" className="border-red-300">
        <Card.Title>
          <H2>{t('event-management.settings.danger.heading')}</H2>
        </Card.Title>

        <ul className="divide-y border-t mt-8">
          <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="space-y-1 grow">
              <Text weight="semibold">
                {event.archived
                  ? t('event-management.settings.danger.restore.heading')
                  : t('event-management.settings.danger.archive.heading')}
              </Text>
              <Subtitle>{t('event-management.settings.danger.archive.description')}</Subtitle>
            </div>
            <Form method="POST" className="w-full sm:w-auto">
              <input type="hidden" name="archived" value={event.archived ? '' : 'true'} />
              <Button
                type="submit"
                name="intent"
                value="archive-event"
                variant={event.archived ? 'secondary' : 'important'}
                iconLeft={event.archived ? ArchiveBoxXMarkIcon : ArchiveBoxArrowDownIcon}
                className="w-full"
              >
                {event.archived
                  ? t('event-management.settings.danger.restore.submit')
                  : t('event-management.settings.danger.archive.submit')}
              </Button>
            </Form>
          </li>
          {permissions.canDeleteEvent ? (
            <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-1 grow">
                <Text weight="semibold">{t('event-management.settings.danger.delete.heading')}</Text>
                <Subtitle>
                  <Trans
                    i18nKey="event-management.settings.danger.delete.description"
                    values={{ name: event.name }}
                    components={[<strong key="1" />]}
                  />
                </Subtitle>
              </div>
              <DeleteModalButton
                intent="delete-event"
                title={t('event-management.settings.danger.delete.submit')}
                description={t('event-management.settings.danger.delete.modal-description', {
                  name: event.name,
                })}
                confirmationText={event.slug}
              />
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
