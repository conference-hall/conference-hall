import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalHeader } from '~/components/organizer-proposal/ProposalHeader';
import { SpeakersPanel } from '~/components/organizer-proposal/SpeakersPanel';
import { ProposalPanel } from '~/components/organizer-proposal/ProposalPanel';
import { OrganizerPanel } from '~/components/organizer-proposal/OrganizerPanel';
import { ProposalFooter } from '~/components/organizer-proposal/ProposalFooter';
import { getProposal } from '~/services/organizers/event.server';
import { mapErrorToResponse } from '~/services/errors';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const proposal = await getProposal(params.proposal!, uid);
    return json(proposal);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizerProposalRoute() {
  const proposal = useLoaderData<typeof loader>();

  return (
    <div className="absolute top-0 z-20 h-screen w-screen bg-white">
      <ProposalHeader className="h-28" proposal={proposal} />
      <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
        <SpeakersPanel className="col-span-2" proposal={proposal} />
        <ProposalPanel className="col-span-4" proposal={proposal} />
        <OrganizerPanel className="col-span-2" rating={proposal.rating} messages={proposal.messages} />
      </div>
      <ProposalFooter className="h-28" />
    </div>
  );
}
