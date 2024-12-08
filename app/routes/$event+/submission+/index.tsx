import { PlusIcon } from '@heroicons/react/20/solid';
import { Submissions } from '~/.server/cfp-submissions/submissions.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import type { Route } from './+types/index.ts';
import { MaxProposalsAlert, MaxProposalsReached } from './components/max-proposals.tsx';
import { NoSubmissionState } from './components/no-submissions-state.tsx';
import { SubmissionTalksList } from './components/submission-talks-list.tsx';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const speakerId = await requireSession(request);
  const speakerProposals = Submissions.for(speakerId, params.event);
  const talkLibrary = TalksLibrary.of(speakerId);
  return {
    proposalsCount: await speakerProposals.count(),
    drafts: await speakerProposals.drafts(),
    talks: await talkLibrary.listForEvent(params.event),
  };
};

export default function EventSubmitRoute({ loaderData }: Route.ComponentProps) {
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
            <H1 className="text-2xl font-bold">Submit a proposal</H1>
            <Subtitle>Select a talk from your library or create a new proposal</Subtitle>
          </div>
          {hasTalksToSubmit && (
            <ButtonLink to="new" variant="primary" iconLeft={PlusIcon}>
              New proposal
            </ButtonLink>
          )}
        </Card.Title>

        <Card.Content>
          {maxProposals && <MaxProposalsAlert maxProposals={maxProposals} proposalsCount={proposalsCount} />}

          {drafts.length > 0 && <SubmissionTalksList label="Your draft proposals" talks={drafts} />}

          {talks.length > 0 && <SubmissionTalksList label="Your talks library" talks={talks} />}

          {!hasTalksToSubmit && <NoSubmissionState />}
        </Card.Content>
      </Card>
    </Page>
  );
}
