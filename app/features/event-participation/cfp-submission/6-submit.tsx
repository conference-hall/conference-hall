import { useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { TalkSection } from '~/features/speaker/talk-library/components/talk-section.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/6-submit.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return TalkSubmission.for(userId, params.event).get(params.talk);
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  await TalkSubmission.for(userId, params.event).submit(params.talk);

  const headers = await toastHeaders('success', t('event.submission.submit.feedback.submitted'));
  return redirect(href('/:event/proposals', { event: params.event }), { headers });
};

export default function SubmissionSubmitRoute({ loaderData: proposal }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();
  const formId = useId();
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
          <Form method="POST" id={formId} className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {currentEvent.codeOfConductUrl ? (
              <Checkbox name="cod-agreement" value="agree" onChange={() => setAcceptCod(!acceptedCod)}>
                <Trans
                  i18nKey="event.submission.submit.agree-cod"
                  components={[<ExternalLink key="cod" href={currentEvent.codeOfConductUrl} />]}
                />
              </Checkbox>
            ) : (
              <div />
            )}

            <div className="flex flex-row justify-end items-center gap-4">
              <ButtonLink to={previousPath} variant="secondary">
                {t('common.go-back')}
              </ButtonLink>
              <Button type="submit" form={formId} disabled={!acceptedCod}>
                {t('event.submission.submit.finish')}
              </Button>
            </div>
          </Form>
        </Card.Content>
      </Card>
    </Page>
  );
}
