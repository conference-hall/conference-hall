import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { TalksLibrary } from '~/features/speaker/talk-library/services/talks-library.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { TalkAlreadySubmittedError } from '~/shared/errors.server.ts';
import { TalkSaveSchema } from '~/shared/types/speaker-talk.types.ts';
import type { Route } from './+types/2-talk.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'proposal' };

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  if (params.talk === 'new') return null;

  const talk = TalksLibrary.of(authUser.id).talk(params.talk);
  const alreadySubmitted = await talk.isSubmittedTo(params.event);
  if (alreadySubmitted) throw new TalkAlreadySubmittedError();

  return talk.get();
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(authUser.id, params.event);
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
          <Button to={previousPath} variant="secondary">
            {t('common.go-back')}
          </Button>
          <Button type="submit" form={formId} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
