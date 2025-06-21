import { PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Submissions } from '~/.server/cfp-submissions/submissions.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { MaxProposalsReached } from '../components/submission-page/max-proposals.tsx';
import { NoSubmissionState } from '../components/submission-page/no-submissions-state.tsx';
import { SubmissionTalksList } from '../components/submission-page/submission-talks-list.tsx';
import type { Route } from './+types/1-selection.ts';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const speakerProposals = Submissions.for(userId, params.event);
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
