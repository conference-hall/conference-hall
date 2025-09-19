import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { CoSpeakerTalkInvite } from '~/features/speaker/talk-invitation/services/co-speaker-talk-invite.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { SpeakerPill } from '../talk-library/components/speakers.tsx';
import type { Route } from './+types/talk-invitation.ts';

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
  return redirect(href('/speaker/talks/:talk', { talk: talk.id }));
};

export default function InvitationRoute({ loaderData: talk }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <FullscreenPage>
      <FullscreenPage.Title title={t('talk.invitation.heading')} subtitle={t('talk.invitation.for-talk')} />

      <Card>
        <Card.Content>
          <H2 size="l">{talk.title}</H2>

          <ul aria-label={t('speaker.list')} className="flex flex-row flex-wrap gap-3">
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
            <Button type="submit">{t('common.accept-invitation')}</Button>
          </Form>
        </Card.Actions>
      </Card>
    </FullscreenPage>
  );
}
