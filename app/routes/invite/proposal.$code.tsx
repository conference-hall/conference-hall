import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { CoSpeakerProposalInvite } from '~/.server/cfp-submissions/co-speaker-proposal-invite.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Markdown } from '~/shared/design-system/markdown.tsx';
import { H2 } from '~/shared/design-system/typography.tsx';
import { EventCard } from '../components/events/event-card.tsx';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import { SpeakerPill } from '../components/talks/co-speaker.tsx';
import type { Route } from './+types/proposal.$code.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Proposal invitation | Conference Hall' }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireUserSession(request);
  const proposal = await CoSpeakerProposalInvite.with(params.code).check();
  return proposal;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const proposal = await CoSpeakerProposalInvite.with(params.code).addCoSpeaker(userId);
  return redirect(href('/:event/proposals/:proposal', { event: proposal.event.slug, proposal: proposal.id }));
};

export default function InvitationRoute({ loaderData: proposal }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title
        title={t('talk.invitation.heading')}
        subtitle={t('talk.invitation.for-event', { event: proposal.event.name })}
      />

      <div className="space-y-8">
        <EventCard {...proposal.event} />

        <Card>
          <Card.Content>
            <H2 size="l">{proposal.title}</H2>

            <ul aria-label={t('speaker.list')} className="flex flex-row flex-wrap gap-3">
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
              <Button type="submit">{t('common.accept-invitation')}</Button>
            </Form>
          </Card.Actions>
        </Card>
      </div>
    </FullscreenPage>
  );
}
