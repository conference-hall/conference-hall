import { parseWithZod } from '@conform-to/zod';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventDetailsSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { EventDetailsForm } from '~/routes/components/events/event-details-form.tsx';
import { EventForm } from '~/routes/components/events/event-form.tsx';
import { DeleteModalButton } from '~/routes/components/modals/delete-modal.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/general.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'general': {
      const schema = await event.buildGeneralSettingsSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;
      const updated = await event.update(result.value);
      const headers = await toastHeaders('success', t('event-management.settings.feedbacks.general-saved'));
      return redirect(`/team/${params.team}/${updated.slug}/settings`, { headers });
    }
    case 'details': {
      const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', t('event-management.settings.feedbacks.details-saved'));
    }
    case 'archive-event': {
      const archived = Boolean(form.get('archived'));
      await event.update({ archived });
      return toast(
        'success',
        archived
          ? t('event-management.settings.feedbacks.archived')
          : t('event-management.settings.feedbacks.restored'),
      );
    }
    case 'delete-event': {
      await event.delete();
      const headers = await toastHeaders('success', t('event-management.settings.feedbacks.deleted'));
      return redirect(`/team/${params.team}`, { headers });
    }
  }
  return null;
};

export default function EventGeneralSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();
  const { userPermissions } = useCurrentTeam();

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
            <EventForm initialValues={currentEvent} errors={errors} />
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
            type={currentEvent.type}
            timezone={currentEvent.timezone}
            conferenceStart={currentEvent.conferenceStart}
            conferenceEnd={currentEvent.conferenceEnd}
            onlineEvent={currentEvent.onlineEvent}
            location={currentEvent.location}
            description={currentEvent.description}
            websiteUrl={currentEvent.websiteUrl}
            contactEmail={currentEvent.contactEmail}
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
                {currentEvent.archived
                  ? t('event-management.settings.danger.restore.heading')
                  : t('event-management.settings.danger.archive.heading')}
              </Text>
              <Subtitle>{t('event-management.settings.danger.archive.description')}</Subtitle>
            </div>
            <Form method="POST" className="w-full sm:w-auto">
              <input type="hidden" name="archived" value={currentEvent.archived ? '' : 'true'} />
              <Button
                type="submit"
                name="intent"
                value="archive-event"
                variant={currentEvent.archived ? 'secondary' : 'important'}
                iconLeft={currentEvent.archived ? ArchiveBoxXMarkIcon : ArchiveBoxArrowDownIcon}
                className="w-full"
              >
                {currentEvent.archived
                  ? t('event-management.settings.danger.restore.submit')
                  : t('event-management.settings.danger.archive.submit')}
              </Button>
            </Form>
          </li>
          {userPermissions.canDeleteEvent ? (
            <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-1 grow">
                <Text weight="semibold">{t('event-management.settings.danger.delete.heading')}</Text>
                <Subtitle>
                  <Trans
                    i18nKey="event-management.settings.danger.delete.description"
                    values={{ name: currentEvent.name }}
                    components={[<strong key="1" />]}
                  />
                </Subtitle>
              </div>
              <DeleteModalButton
                intent="delete-event"
                title={t('event-management.settings.danger.delete.submit')}
                description={t('event-management.settings.danger.delete.modal-description', {
                  name: currentEvent.name,
                })}
                confirmationText={currentEvent.slug}
              />
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
