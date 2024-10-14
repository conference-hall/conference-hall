import type { LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useEvent } from '../__components/use-event.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const settingName = form.get('_setting') as string;
  await event.update({ [settingName]: form.get(settingName) === 'true' });
  return toast('success', 'Review setting saved.');
};

export default function EventReviewSettingsRoute() {
  const { event } = useEvent();
  const fetcher = useFetcher<typeof action>();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>Enable proposals reviews</H2>

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
