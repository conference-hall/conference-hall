import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { isMaxSpeakersExceeded } from '~/features/event-participation/cfp-submission/models/max-speakers.ts';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { ProfileFetcher } from '~/features/speaker/services/profile-fetcher.server.ts';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { RequireAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { FunnelSpeakerSchema } from '~/shared/types/speaker.types.ts';
import type { Route } from './+types/3-speakers.ts';
import { CoSpeakersList } from './components/co-speakers-list.tsx';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'speakers' };

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const speaker = await ProfileFetcher.for(authUser.id).get();
  const proposal = await TalkSubmission.for(authUser.id, params.event).get(params.talk);

  return {
    speaker,
    invitationLink: proposal.invitationLink,
    isOwner: proposal.isOwner,
    speakers: proposal.speakers,
  };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = context.get(RequireAuthContext);
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'remove-speaker') {
    const speakerId = String(form.get('_speakerId'));
    await TalkSubmission.for(authUser.id, params.event).removeCoSpeaker(params.talk, speakerId);
    return null;
  } else {
    const result = parseWithZod(form, { schema: FunnelSpeakerSchema });
    if (result.status !== 'success') return result.error;
    await SpeakerProfile.for(authUser.id).save(result.value);
  }

  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionSpeakerRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { speaker, speakers, isOwner, invitationLink } = loaderData;
  const formId = useId();
  const { previousPath, nextPath } = useSubmissionNavigation();
  const { maxSpeakersPerProposal } = useCurrentEvent();
  const maxSpeakersExceeded = isMaxSpeakersExceeded(speakers.length, maxSpeakersPerProposal);

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
              error={errors?.bio}
              defaultValue={speaker.bio || ''}
              rows={5}
              className="field-sizing-content min-h-32"
            />
          </Form>
          <div className="mt-4">
            <H2>{t('event.submission.speakers.co-speakers')}</H2>
            <Subtitle>{t('event.submission.speakers.co-speakers.description')}</Subtitle>
            <CoSpeakersList
              speakers={speakers}
              maxSpeakersPerProposal={maxSpeakersPerProposal}
              invitationLink={invitationLink}
              canEdit={isOwner}
            />
          </div>
        </Card.Content>

        <Card.Actions>
          <Button to={previousPath} variant="secondary">
            {t('common.go-back')}
          </Button>
          <Button
            type="submit"
            form={formId}
            name="redirectTo"
            value={nextPath}
            iconRight={ArrowRightIcon}
            disabled={maxSpeakersExceeded}
          >
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
