import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { TalkAlreadySubmittedError } from '~/libs/errors.server.ts';
import { TalkForm } from '~/routes/components/talks/talk-forms/talk-form.tsx';
import type { Route } from './+types/$talk.index.ts';
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
  return redirect(`/${params.event}/submission/${proposal.talkId}/speakers`);
};

export default function SubmissionTalkRoute({ loaderData: talk, actionData: errors }: Route.ComponentProps) {
  const { previousPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>Your proposal</H2>
        </Card.Title>

        <Card.Content>
          <TalkForm id="talk-form" initialValues={talk} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            Go back
          </ButtonLink>
          <Button type="submit" form="talk-form" iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
