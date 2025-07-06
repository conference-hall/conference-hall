import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { ProfileFetcher } from '~/features/speaker/services/profile-fetcher.server.ts';
import { FunnelSpeakerSchema } from '~/features/speaker/settings/services/speaker-profile.schema.server.ts';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { Speakers } from '~/features/speaker/talk-library/components/speakers.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/3-speakers.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const speaker = await ProfileFetcher.for(userId).get();
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
            <Speakers speakers={speakers} invitationLink={invitationLink} canEdit={isOwner} className="mt-6" />
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
