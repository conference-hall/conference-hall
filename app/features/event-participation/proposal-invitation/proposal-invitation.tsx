import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { getProtectedSession, protectedRouteMiddleware } from '~/shared/auth/auth.middleware.ts';
import { EventCard } from '../../event-search/components/event-card.tsx';
import { SpeakerPill } from '../../speaker/talk-library/components/speakers.tsx';
import type { Route } from './+types/proposal-invitation.ts';
import { CoSpeakerProposalInvite } from './services/co-speaker-proposal-invite.server.ts';

export const middleware = [protectedRouteMiddleware];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Proposal invitation | Conference Hall' }]);
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const proposal = await CoSpeakerProposalInvite.with(params.code).check();
  return proposal;
};

export const action = async ({ params, context }: Route.ActionArgs) => {
  const { userId } = getProtectedSession(context);
  const proposal = await CoSpeakerProposalInvite.with(params.code).addCoSpeaker(userId);
  return redirect(href('/:event/proposals/:proposal', { event: proposal.event.slug, proposal: proposal.id }));
};

export default function InvitationRoute({ loaderData: proposal }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <FullscreenPage>
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
