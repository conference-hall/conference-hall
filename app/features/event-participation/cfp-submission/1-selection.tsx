import { PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { SpeakerProposals } from '~/features/event-participation/speaker-proposals/services/speaker-proposals.server.ts';
import { TalksLibrary } from '~/features/speaker/talk-library/services/talks-library.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/1-selection.ts';
import { MaxProposalsReached } from './components/max-proposals.tsx';
import { NoSubmissionState } from './components/no-submissions-state.tsx';
import { SubmissionTalksList } from './components/submission-talks-list.tsx';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const speakerProposals = SpeakerProposals.for(userId, params.event);
  const talkLibrary = TalksLibrary.of(userId);
  return {
    proposalsCount: await speakerProposals.count(),
    drafts: await speakerProposals.drafts(),
    talks: await talkLibrary.listForEvent(params.event),
  };
};

export default function EventSubmitRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { proposalsCount, drafts, talks } = loaderData;
  const { maxProposals } = useCurrentEvent();
  const hasMaxProposals = maxProposals && proposalsCount >= maxProposals;
  const hasTalksToSubmit = drafts.length > 0 || talks.length > 0;

  if (hasMaxProposals) {
    return (
      <Page>
        <MaxProposalsReached maxProposals={maxProposals} />
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <Card.Title className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <H1 className="text-2xl font-bold">{t('event.submission.selection.heading')}</H1>
            <Subtitle>{t('event.submission.selection.description')}</Subtitle>
          </div>
          {hasTalksToSubmit && (
            <ButtonLink to="new" variant="primary" iconLeft={PlusIcon}>
              {t('event.submission.selection.new-proposal')}
            </ButtonLink>
          )}
        </Card.Title>

        <Card.Content>
          {maxProposals && <Callout title={t('event.submission.selection.max-limit', { maxProposals })} />}

          {drafts.length > 0 && <SubmissionTalksList label={t('event.submission.selection.drafts')} talks={drafts} />}

          {talks.length > 0 && <SubmissionTalksList label={t('event.submission.selection.talks')} talks={talks} />}

          {!hasTalksToSubmit && <NoSubmissionState />}
        </Card.Content>
      </Card>
    </Page>
  );
}
