import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import FullscreenDialog from '~/design-system/dialogs/FullscreenDialog';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalHeader } from '~/components/proposal-review/ProposalHeader';
import { SpeakersPanel } from '~/components/proposal-review/SpeakersPanel';
import { OrganizerPanel } from '~/components/proposal-review/OrganizerPanel';
import { ProposalFooter } from '~/components/proposal-review/ProposalFooter';
import { getProposalReview, validateFilters } from '~/services/organizers/event.server';
import { mapErrorToResponse } from '~/services/errors';
import { Outlet, useLoaderData, useNavigate, useOutletContext, useSearchParams } from '@remix-run/react';
import type { OrganizerEventContext } from '../../$eventSlug';

export type OrganizerProposalContext = {
  proposalReview: Awaited<ReturnType<typeof getProposalReview>>;
} & OrganizerEventContext;

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const url = new URL(request.url);
    const filters = validateFilters(url.searchParams);
    const result = await getProposalReview(params.slug!, params.eventSlug!, params.proposal!, uid, filters);
    return json({ uid, ...result });
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizerProposalRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { event } = useOutletContext<OrganizerEventContext>();
  const proposalReview = useLoaderData<typeof loader>();
  const { uid, proposal, pagination } = proposalReview;

  return (
    <FullscreenDialog title="Proposal review" onClose={() => navigate(`../proposals?${searchParams.toString()}`)}>
      <ProposalHeader className="h-28" proposal={proposal} current={pagination.current} total={pagination.total} />
      <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
        <SpeakersPanel className="col-span-2" proposal={proposal} />
        <div className="col-span-4 overflow-hidden">
          <Outlet context={{ event, proposalReview }} />
        </div>
        <OrganizerPanel className="col-span-2" uid={uid} messages={proposal.messages} />
      </div>
      <ProposalFooter
        className="h-28"
        userRating={proposal.rating.userRating}
        nextId={pagination.nextId}
        previousId={pagination.previousId}
      />
    </FullscreenDialog>
  );
}
