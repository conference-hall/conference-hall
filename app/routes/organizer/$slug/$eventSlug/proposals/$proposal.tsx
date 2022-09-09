import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalModal } from '~/components/organizer-proposal/ProposalModal';
import { useParams } from '@remix-run/react';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json({});
};

export default function OrganizerEventProposalRoute() {
  const { proposal } = useParams();
  return <ProposalModal proposal={proposal!} />;
}
