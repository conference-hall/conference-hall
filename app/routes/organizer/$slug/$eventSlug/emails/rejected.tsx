import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLocation } from '@remix-run/react';
import { ProposalsEmailList } from '~/components/email-campaigns/ProposalsEmailList';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function RejectedProposalEmails() {
  const location = useLocation();

  return (
    <>
      <H1 className="sr-only">Rejection emails campaign</H1>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Rejected proposals</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Emails sent</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Emails delivered</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
      </dl>
      {[].length > 0 && (
        <div>
          <H2 className="mt-12">Select proposals to send rejection emails</H2>
          <ProposalsEmailList proposals={[]} total={0} />
          <Pagination pathname={location.pathname} current={1} total={1} className="mt-8" />
        </div>
      )}
    </>
  );
}
