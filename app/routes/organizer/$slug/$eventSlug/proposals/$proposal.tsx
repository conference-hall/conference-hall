import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalHeader } from '~/components/proposal-review/ProposalHeader';
import { SpeakersPanel } from '~/components/proposal-review/SpeakersPanel';
import { ProposalPanel } from '~/components/proposal-review/ProposalPanel';
import { OrganizerPanel } from '~/components/proposal-review/OrganizerPanel';
import { ProposalFooter } from '~/components/proposal-review/ProposalFooter';
import { getProposalReview, validateFilters } from '~/services/organizers/event.server';
import { mapErrorToResponse } from '~/services/errors';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const url = new URL(request.url);
    const filters = validateFilters(url.searchParams);
    const result = await getProposalReview(params.eventSlug!, params.proposal!, uid, filters);
    return json(result);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizerProposalRoute() {
  const { proposal, pagination } = useLoaderData<typeof loader>();

  return (
    <div className="absolute top-0 z-20 h-screen w-screen bg-white">
      <ProposalHeader className="h-28" proposal={proposal} current={pagination.current} total={pagination.total} />
      <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
        <SpeakersPanel className="col-span-2" proposal={proposal} />
        <ProposalPanel className="col-span-4" proposal={proposal} />
        <OrganizerPanel className="col-span-2" messages={proposal.messages} />
      </div>
      <ProposalFooter
        className="h-28"
        userRating={proposal.rating.userRating}
        nextId={pagination.nextId}
        previousId={pagination.previousId}
      />
    </div>
  );
}
