import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { FunnelSpeakerSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { CoSpeakers } from '~/routes/components/talks/co-speaker.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button, ButtonLink } from '~/shared/design-system/buttons.tsx';
import { MarkdownTextArea } from '~/shared/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';
import { useSubmissionNavigation } from '../components/submission-page/submission-context.tsx';
import type { Route } from './+types/3-speakers.ts';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const speaker = await SpeakerProfile.for(userId).get();
  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);

  return {
    speaker,
    invitationLink: proposal.invitationLink,
    isOwner: proposal.isOwner,
    speakers: proposal.speakers.filter((speaker) => speaker.userId !== userId),
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'remove-speaker') {
    const speakerId = String(form.get('_speakerId'));
    await TalkSubmission.for(userId, params.event).removeCoSpeaker(params.talk, speakerId);
    return null;
  } else {
    const result = parseWithZod(form, { schema: FunnelSpeakerSchema });
    if (result.status !== 'success') return result.error;
    await SpeakerProfile.for(userId).save(result.value);
  }

  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionSpeakerRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { speaker, speakers, isOwner, invitationLink } = loaderData;
  const formId = useId();
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>{t('event.submission.speakers.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <Form id={formId} method="POST">
            <MarkdownTextArea
              name="bio"
              label={t('speaker.profile.biography')}
              rows={5}
              error={errors?.bio}
              defaultValue={speaker.bio || ''}
              className="mb-3"
            />
          </Form>
          <div className="mt-4">
            <H2>{t('event.submission.speakers.co-speakers')}</H2>
            <Subtitle>{t('event.submission.speakers.co-speakers.description')}</Subtitle>
            <CoSpeakers speakers={speakers} invitationLink={invitationLink} canEdit={isOwner} className="mt-6" />
          </div>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            {t('common.go-back')}
          </ButtonLink>
          <Button type="submit" form={formId} name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
