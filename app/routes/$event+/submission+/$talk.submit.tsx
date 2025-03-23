import { useState } from 'react';
import { Form, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { TalkSection } from '~/routes/components/talks/talk-section.tsx';
import type { Route } from './+types/$talk.submit.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return TalkSubmission.for(userId, params.event).get(params.talk);
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  await TalkSubmission.for(userId, params.event).submit(params.talk);

  const headers = await toastHeaders('success', 'Congratulation! Proposal submitted!');
  return redirect(`/${params.event}/proposals`, { headers });
};

export default function SubmissionSubmitRoute({ loaderData: proposal }: Route.ComponentProps) {
  const currentEvent = useCurrentEvent();
  const [acceptedCod, setAcceptCod] = useState(!currentEvent.codeOfConductUrl);
  const { previousPath } = useSubmissionNavigation();

  return (
    <Page className="space-y-4">
      <TalkSection
        talk={proposal}
        event={currentEvent}
        canEditTalk={false}
        canEditSpeakers={false}
        canArchive={false}
        showFormats
        showCategories
      />
      <Card>
        <Card.Content>
          <Form method="POST" id="submit-form" className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {currentEvent.codeOfConductUrl ? (
              <Checkbox
                id="cod-agreement"
                name="cod-agreement"
                value="agree"
                onChange={() => setAcceptCod(!acceptedCod)}
              >
                Please agree with the <ExternalLink href={currentEvent.codeOfConductUrl}>code of conduct</ExternalLink>{' '}
                of the event.
              </Checkbox>
            ) : (
              <div />
            )}

            <div className="flex flex-row justify-end items-center gap-4">
              <ButtonLink to={previousPath} variant="secondary">
                Go back
              </ButtonLink>
              <Button type="submit" form="submit-form" disabled={!acceptedCod}>
                Submit proposal
              </Button>
            </div>
          </Form>
        </Card.Content>
      </Card>
    </Page>
  );
}
