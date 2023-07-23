import { json, type LoaderArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ToggleGroup } from '~/design-system/forms/Toggles';
import { Card } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { updateEvent } from '~/routes/__server/teams/update-event.server';

import { useOrganizerEvent } from '../_layout';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const settingName = form.get('_setting') as string;
  await updateEvent(params.event, userId, { [settingName]: form.get(settingName) === 'true' });
  return json(null, await addToast(request, 'Review setting saved.'));
};

export default function EventReviewSettingsRoute() {
  const { event } = useOrganizerEvent();
  const fetcher = useFetcher();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>Proposals review</H2>

        <ToggleGroup
          label="Proposals review activation"
          description="When disabled, reviewers won't be able to review proposals anymore."
          value={event.reviewEnabled}
          onChange={(checked) =>
            fetcher.submit({ _setting: 'reviewEnabled', reviewEnabled: String(checked) }, { method: 'POST' })
          }
        />
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Review settings</H2>
        </Card.Title>

        <Card.Content>
          <ToggleGroup
            label="Display reviews of all team members"
            description="When disabled, reviews of all team members and global note won't be visible."
            value={event.displayProposalsReviews}
            onChange={(checked) =>
              fetcher.submit(
                { _setting: 'displayProposalsReviews', displayProposalsReviews: String(checked) },
                { method: 'POST' },
              )
            }
          />
          <ToggleGroup
            label="Display speakers in proposal page"
            description="When disabled, all speakers information are not visible in proposal list and review page. Used for anonymized reviews."
            value={event.displayProposalsSpeakers}
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
