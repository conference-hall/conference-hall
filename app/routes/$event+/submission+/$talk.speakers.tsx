import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Form, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { DetailsSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { CoSpeakers } from '~/routes/components/talks/co-speaker.tsx';
import type { Route } from './+types/$talk.speakers.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const speaker = await SpeakerProfile.for(userId).get();
  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);

  return {
    speaker,
    invitationLink: proposal.invitationLink,
    isOwner: proposal.isOwner,
    speakers: proposal.speakers.filter((speaker) => speaker.id !== userId),
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'remove-speaker') {
    const speakerId = String(form.get('_speakerId'));
    await TalkSubmission.for(userId, params.event).removeCoSpeaker(params.talk, speakerId);
    return null;
  } else {
    const result = parseWithZod(form, { schema: DetailsSchema });
    if (result.status !== 'success') return result.error;
    await SpeakerProfile.for(userId).save(result.value);
  }

  throw redirect(String(form.get('redirectTo')));
};

export default function SubmissionSpeakerRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { speaker, speakers, isOwner, invitationLink } = loaderData;
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>Speaker details</H2>
        </Card.Title>

        <Card.Content>
          <Form id="speakers-form" method="POST">
            <MarkdownTextArea
              name="bio"
              label="Biography"
              rows={5}
              error={errors?.bio}
              defaultValue={speaker.bio || ''}
              className="mb-3"
            />
            <Text variant="secondary">
              You can give more information about you from{' '}
              <ExternalLink href="/speaker/profile">the profile page.</ExternalLink>
            </Text>
            <input type="hidden" name="references" value={speaker.references || ''} />
          </Form>
          <div className="mt-4">
            <H2>Co-speakers</H2>
            <Subtitle>When co-speaker accepts the invite, he/she will be automatically added to the proposal.</Subtitle>
            <CoSpeakers speakers={speakers} invitationLink={invitationLink} canEdit={isOwner} className="mt-6" />
          </div>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            Go back
          </ButtonLink>
          <Button type="submit" form="speakers-form" name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
