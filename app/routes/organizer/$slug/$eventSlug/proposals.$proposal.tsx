import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalHeader } from '~/components/organizer-proposal/ProposalHeader';
import { SpeakersPanel } from '~/components/organizer-proposal/SpeakersPanel';
import { ProposalPanel } from '~/components/organizer-proposal/ProposalPanel';
import { OrganizerPanel } from '~/components/organizer-proposal/OrganizerPanel';
import { ProposalFooter } from '~/components/organizer-proposal/ProposalFooter';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json({});
};

export default function OrganizerProposalRoute() {
  return (
    <div className="absolute top-0 z-20 h-screen bg-white">
      <ProposalHeader className="h-28" />
      <div className="grid h-[calc(100%-224px)] grid-cols-8 items-stretch divide-x divide-gray-200">
        <SpeakersPanel className="col-span-2" />
        <ProposalPanel className="col-span-4" />
        <OrganizerPanel className="col-span-2" />
      </div>
      <ProposalFooter className="h-28" />
    </div>
  );
}
