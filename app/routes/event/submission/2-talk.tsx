import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { TalkAlreadySubmittedError } from '~/libs/errors.server.ts';
import { TalkForm } from '~/routes/components/talks/talk-forms/talk-form.tsx';
import { Button, ButtonLink } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { H2 } from '~/shared/design-system/typography.tsx';
import { useSubmissionNavigation } from '../components/submission-page/submission-context.tsx';
import type { Route } from './+types/2-talk.ts';

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
