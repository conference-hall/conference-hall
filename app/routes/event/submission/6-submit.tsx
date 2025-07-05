import { useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { TalkSection } from '~/routes/components/talks/talk-section.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button, ButtonLink } from '~/shared/design-system/buttons.tsx';
import { Checkbox } from '~/shared/design-system/forms/checkboxes.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { ExternalLink } from '~/shared/design-system/links.tsx';
import { useSubmissionNavigation } from '../components/submission-page/submission-context.tsx';
import type { Route } from './+types/6-submit.ts';

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
