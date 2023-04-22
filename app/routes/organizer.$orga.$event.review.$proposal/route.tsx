import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import FullscreenDialog from '~/design-system/dialogs/FullscreenDialog';
import { requireSession } from '~/libs/auth/cookies';
import { BottomPanel } from '~/routes/organizer.$orga.$event.review.$proposal/components/BottomPanel';
import { mapErrorToResponse } from '~/libs/errors';
import { Outlet, useLoaderData, useNavigate, useOutletContext, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import type { ProposalReview } from './server/get-proposal-review.server';
import { getProposalReview } from './server/get-proposal-review.server';
import { TopPanel } from './components/TopPanel';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { useUser } from '~/root';
import { useOrganization } from '../organizer.$orga/route';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const url = new URL(request.url);
    const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
    const proposal = await getProposalReview(params.orga, params.event, params.proposal, uid, filters.data ?? {});
    return json(proposal);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizerProposalRoute() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { event } = useOrganizerEvent();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalReview = useLoaderData<typeof loader>();
  const { proposal, pagination } = proposalReview;

  return (
    <FullscreenDialog title="Proposal review" onClose={() => navigate(`..?${searchParams.toString()}`)}>
      <TopPanel className="h-28" proposal={proposal} current={pagination.current} total={pagination.total} />
      <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
        <LeftPanel className="col-span-2" proposal={proposal} />
        <section aria-label="Proposal details section" className="col-span-4 overflow-hidden">
          <Outlet context={{ user, organization, event, proposalReview }} />
        </section>
        <RightPanel className="col-span-2" uid={user?.id!} messages={proposal.messages} />
      </div>
      <BottomPanel
        className="h-28"
        userRating={proposal.rating.userRating}
        nextId={pagination.nextId}
        previousId={pagination.previousId}
      />
    </FullscreenDialog>
  );
}

export function useProposalReview() {
  return useOutletContext<{ proposalReview: ProposalReview }>();
}
