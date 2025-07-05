import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { useCurrentEvent } from '~/features/event-management/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/review.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const settingName = form.get('_setting') as string;
  await event.update({ [settingName]: form.get(settingName) === 'true' });
  return toast('success', t('event-management.settings.reviews.enable.feedbacks.saved'));
};

export default function EventReviewSettingsRoute() {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();
  const fetcher = useFetcher<typeof action>();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>{t('event-management.settings.reviews.enable.heading')}</H2>

        <ToggleGroup
          label={t('event-management.settings.reviews.enable.toggle.label')}
          description={t('event-management.settings.reviews.enable.toggle.description')}
          value={currentEvent.reviewEnabled}
          onChange={(checked) =>
            fetcher.submit({ _setting: 'reviewEnabled', reviewEnabled: String(checked) }, { method: 'POST' })
          }
        />
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.reviews.settings.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <ToggleGroup
            label={t('event-management.settings.reviews.settings.toggle-reviews.label')}
            description={t('event-management.settings.reviews.settings.toggle-reviews.description')}
            value={currentEvent.displayProposalsReviews}
            onChange={(checked) =>
              fetcher.submit(
                { _setting: 'displayProposalsReviews', displayProposalsReviews: String(checked) },
                { method: 'POST' },
              )
            }
          />
          <ToggleGroup
            label={t('event-management.settings.reviews.settings.toggle-speakers.label')}
            description={t('event-management.settings.reviews.settings.toggle-speakers.description')}
            value={currentEvent.displayProposalsSpeakers}
            onChange={(checked) =>
              fetcher.submit(
                { _setting: 'displayProposalsSpeakers', displayProposalsSpeakers: String(checked) },
                { method: 'POST' },
              )
            }
          />
        </Card.Content>
      </Card>
    </>
  );
}
