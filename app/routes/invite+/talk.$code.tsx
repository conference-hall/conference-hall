import { Form, redirect } from 'react-router';
import { CoSpeakerTalkInvite } from '~/.server/speaker-talks-library/co-speaker-talk-invite.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import { SpeakerPill } from '../components/talks/co-speaker.tsx';
import type { Route } from './+types/talk.$code.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Talk invitation | Conference Hall' }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireUserSession(request);
  const talk = await CoSpeakerTalkInvite.with(params.code).check();
  return talk;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const talk = await CoSpeakerTalkInvite.with(params.code).addCoSpeaker(userId);
  return redirect(`/speaker/talks/${talk.id}`);
};

export default function InvitationRoute({ loaderData: talk }: Route.ComponentProps) {
  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title title="Talk invitation." subtitle="You have been invited to be co-speaker on a talk." />

      <Card>
        <Card.Content>
          <H2 size="l">{talk.title}</H2>

          <ul aria-label="Speakers" className="flex flex-row flex-wrap gap-3">
            {talk.speakers.map((speaker) => (
              <li key={speaker.name}>
                <SpeakerPill speaker={speaker} />
              </li>
            ))}
          </ul>

          <Markdown className="line-clamp-6">{talk.description}</Markdown>
        </Card.Content>

        <Card.Actions>
          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card.Actions>
      </Card>
    </FullscreenPage>
  );
}
