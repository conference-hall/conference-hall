import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { TalkSaveSchema } from '~/features/speaker/talk-library/services/talks-library.schema.server.ts';
import { TalksLibrary } from '~/features/speaker/talk-library/services/talks-library.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { TalkAlreadySubmittedError } from '~/shared/errors.server.ts';
import type { Route } from './+types/2-talk.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  if (params.talk === 'new') return null;

  const talk = TalksLibrary.of(userId).talk(params.talk);
  const alreadySubmitted = await talk.isSubmittedTo(params.event);
  if (alreadySubmitted) throw new TalkAlreadySubmittedError();

  return talk.get();
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(userId, params.event);
  const proposal = await submission.saveDraft(params.talk, result.value);
  return redirect(href('/:event/submission/:talk/speakers', { event: params.event, talk: proposal.talkId }));
};

export default function SubmissionTalkRoute({ loaderData: talk, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { previousPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>{t('event.submission.proposal.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <TalkForm id={formId} initialValues={talk} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            {t('common.go-back')}
          </ButtonLink>
          <Button type="submit" form={formId} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
