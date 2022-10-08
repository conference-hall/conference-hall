import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import { ProposalsEmailList } from '~/components/email-campaigns/ProposalsEmailList';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { searchProposals } from '~/services/organizers/event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const url = new URL(request.url);
  const page = await parsePage(url.searchParams);
  try {
    const results = await searchProposals(params.slug!, params.eventSlug!, uid, { status: 'ACCEPTED' }, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function AcceptedProposalEmails() {
  const { results, pagination, total } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <>
      <H1 className="sr-only">Acceptation emails campaign</H1>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Accepted proposals</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{results.length}</dd>
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
      {results.length > 0 && (
        <div>
          <H2 className="mt-12">Select proposals to send acceptation emails</H2>
          <ProposalsEmailList proposals={results} total={total} />
          <Pagination
            pathname={location.pathname}
            current={pagination.current}
            total={pagination.total}
            className="mt-8"
          />
        </div>
      )}
    </>
  );
}
