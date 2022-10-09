import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CampaignEmailFilters } from '~/components/campaign-email/CampaignEmailFilters';
import { CampaignEmailList } from '~/components/campaign-email/CampaignEmailList';
import { StatIndicator } from '~/design-system/charts/StatIndicator';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import type { ProposalsFilters } from '~/schemas/proposal';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { searchProposals } from '~/services/organizers/event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const url = new URL(request.url);
  const { data } = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);
  const { slug, eventSlug } = params;
  const filters = { query: data?.query, status: ['REJECTED'] } as ProposalsFilters;

  try {
    const results = await searchProposals(slug!, eventSlug!, uid, filters, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function RejectedProposalEmails() {
  const { results, pagination, total } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (
    <>
      <H1 className="sr-only">Rejection emails campaign</H1>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatIndicator label="Rejected proposals">{results.length}</StatIndicator>
        <StatIndicator label="Emails sent">0</StatIndicator>
        <StatIndicator label="Emails delivered">0</StatIndicator>
      </dl>
      <div>
        <H2 className="mt-12">Select proposals to send rejection emails</H2>
        <CampaignEmailFilters pathname={location.pathname} query={searchParams.get('query')} />
        <CampaignEmailList proposals={results} total={total} />
        <Pagination
          pathname={location.pathname}
          current={pagination.current}
          total={pagination.total}
          className="mt-8"
        />
      </div>
    </>
  );
}
