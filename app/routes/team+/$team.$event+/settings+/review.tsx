import { type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ToggleGroup } from '~/design-system/forms/Toggles.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { updateEvent } from '~/routes/__server/teams/update-event.server.ts';

import { useTeamEvent } from '../_layout.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const settingName = form.get('_setting') as string;
  await updateEvent(params.event, userId, { [settingName]: form.get(settingName) === 'true' });
  return toast('success', 'Review setting saved.');
};

export default function EventReviewSettingsRoute() {
  const { event } = useTeamEvent();
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
            label="Display speakers in review pages"
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
