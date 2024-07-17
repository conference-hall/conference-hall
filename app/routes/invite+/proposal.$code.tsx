import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CoSpeakerProposalInvite } from '~/.server/cfp-submissions/co-speaker-proposal-invite.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { EventCard } from '../__components/events/event-card.tsx';
import { FullscreenPage } from '../__components/fullscreen-page.tsx';
import { SpeakerPill } from '../__components/talks/co-speaker.tsx';

export const meta = mergeMeta(() => [{ title: 'Proposal invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await CoSpeakerProposalInvite.with(params.code).check();
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await CoSpeakerProposalInvite.with(params.code).addCoSpeaker(userId);
  return redirect(`/${proposal.event.slug}/proposals/${proposal.id}`);
};

export default function InvitationRoute() {
  const proposal = useLoaderData<typeof loader>();

  return (
    <FullscreenPage>
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
