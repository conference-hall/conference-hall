import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/review.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const event = EventSettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const settingName = form.get('_setting') as string;
  await event.update({ [settingName]: form.get(settingName) === 'true' });
  return toast('success', i18n.t('event-management.settings.reviews.enable.feedbacks.saved'));
};

export default function EventReviewSettingsRoute() {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const reviewEnabledFetcher = useFetcher<typeof action>({ key: 'review-enabled' });
  const displayProposalsReviewsFetcher = useFetcher<typeof action>({ key: 'display-proposals-reviews' });
  const displayProposalsSpeakersFetcher = useFetcher<typeof action>({ key: 'display-proposals-speakers' });

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>{t('event-management.settings.reviews.enable.heading')}</H2>

        <ToggleGroup
          label={t('event-management.settings.reviews.enable.toggle.label')}
          description={t('event-management.settings.reviews.enable.toggle.description')}
          value={event.reviewEnabled}
          onChange={(checked) =>
            reviewEnabledFetcher.submit(
              { _setting: 'reviewEnabled', reviewEnabled: String(checked) },
              { method: 'POST' },
            )
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
            value={event.displayProposalsReviews}
            onChange={(checked) =>
              displayProposalsReviewsFetcher.submit(
                { _setting: 'displayProposalsReviews', displayProposalsReviews: String(checked) },
                { method: 'POST' },
              )
            }
          />
          <ToggleGroup
            label={t('event-management.settings.reviews.settings.toggle-speakers.label')}
            description={t('event-management.settings.reviews.settings.toggle-speakers.description')}
            value={event.displayProposalsSpeakers}
            onChange={(checked) =>
              displayProposalsSpeakersFetcher.submit(
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
