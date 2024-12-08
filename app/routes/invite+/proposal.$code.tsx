import { Form, redirect } from 'react-router';
import { CoSpeakerProposalInvite } from '~/.server/cfp-submissions/co-speaker-proposal-invite.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { EventCard } from '../components/events/event-card.tsx';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import { SpeakerPill } from '../components/talks/co-speaker.tsx';
import type { Route } from './+types/proposal.$code.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Proposal invitation | Conference Hall' }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireSession(request);
  const proposal = await CoSpeakerProposalInvite.with(params.code).check();
  return proposal;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const proposal = await CoSpeakerProposalInvite.with(params.code).addCoSpeaker(userId);
  throw redirect(`/${proposal.event.slug}/proposals/${proposal.id}`);
};

export default function InvitationRoute({ loaderData: proposal }: Route.ComponentProps) {
  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title
        title="Talk invitation."
        subtitle={`You have been invited to be co-speaker on a talk for the ${proposal.event.slug} event.`}
      />

      <div className="space-y-8">
        <EventCard {...proposal.event} />

        <Card>
          <Card.Content>
            <H2 size="l">{proposal.title}</H2>

            <ul aria-label="Speakers" className="flex flex-row flex-wrap gap-3">
              {proposal.speakers.map((speaker) => (
                <li key={speaker.name}>
                  <SpeakerPill speaker={speaker} />
                </li>
              ))}
            </ul>

            <Markdown className="line-clamp-6">{proposal.description}</Markdown>
          </Card.Content>

          <Card.Actions>
            <Form method="POST">
              <Button type="submit">Accept invitation</Button>
            </Form>
          </Card.Actions>
        </Card>
      </div>
    </FullscreenPage>
  );
}
