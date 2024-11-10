import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Submissions } from '~/.server/cfp-submissions/submissions.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { useCurrentEvent } from '~/routes/__components/contexts/event-page-context.tsx';
import { MaxProposalsAlert, MaxProposalsReached } from './__components/max-proposals.tsx';
import { NoSubmissionState } from './__components/no-submissions-state.tsx';
import { SubmissionTalksList } from './__components/submission-talks-list.tsx';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const speakerProposals = Submissions.for(speakerId, params.event);
  const talkLibrary = TalksLibrary.of(speakerId);

  return {
    proposalsCount: await speakerProposals.count(),
    drafts: await speakerProposals.drafts(),
    talks: await talkLibrary.listForEvent(params.event),
  };
};

export default function EventSubmitRoute() {
  const { proposalsCount, drafts, talks } = useLoaderData<typeof loader>();
  const { maxProposals } = useCurrentEvent();

  if (maxProposals && proposalsCount >= maxProposals) {
    return (
      <Page>
        <MaxProposalsReached maxProposals={maxProposals} />
      </Page>
    );
  }

  return (
    <Page>
      <Page.Heading title="Submit a proposal" subtitle="Select a talk from your library or create a new proposal">
        {(drafts.length !== 0 || talks.length !== 0) && (
          <ButtonLink to="new" variant="primary" iconLeft={PlusIcon}>
            New proposal
          </ButtonLink>
        )}
      </Page.Heading>

      <div className="space-y-8">
        {maxProposals && <MaxProposalsAlert maxProposals={maxProposals} proposalsCount={proposalsCount} />}

        {drafts.length > 0 && (
          <section className="space-y-4">
            <SubmissionTalksList label="Your draft proposals" talks={drafts} />
          </section>
        )}

        {talks.length > 0 && (
          <section className="space-y-4">
            <SubmissionTalksList label="Your talks library" talks={talks} />
          </section>
        )}

        {drafts.length === 0 && talks.length === 0 && (
          <section className="space-y-4">
            <NoSubmissionState />
          </section>
        )}
      </div>
    </Page>
  );
}
