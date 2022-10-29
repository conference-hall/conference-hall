import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ProposalsFilters } from '~/schemas/proposal';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CampaignEmailFilters } from '~/components/campaign-email/CampaignEmailFilters';
import { CampaignEmailList, CampaignType } from '~/components/campaign-email/CampaignEmailList';
import { StatIndicator } from '~/design-system/charts/StatIndicator';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import { ProposalSelectionSchema } from '~/schemas/proposal';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { getAcceptationCampaignStats, sendAcceptationCampaign } from '~/services/organizers/emails-campaign.server';
import { searchProposals } from '~/services/organizers/event.server';
import { createToast } from '~/utils/toasts';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const url = new URL(request.url);
  const { data } = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);
  const { slug, eventSlug } = params;
  const filters = { query: data?.query, status: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] } as ProposalsFilters;

  try {
    const proposals = await searchProposals(slug!, eventSlug!, uid, filters, page);
    const stats = await getAcceptationCampaignStats(slug!, eventSlug!, uid);
    return json({ proposals, stats });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const { data, error } = await withZod(ProposalSelectionSchema).validate(form);
  if (error) return json(null);
  await sendAcceptationCampaign(slug!, eventSlug!, uid, data.selection);
  return json(null, await createToast(session, 'Emails successfully sent.'));
};

export default function AcceptedProposalEmails() {
  const { proposals, stats } = useLoaderData<typeof loader>();
  const { results, pagination, total } = proposals;
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (
    <>
      <H1 className="sr-only">Acceptation emails campaign</H1>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatIndicator label="Accepted proposals">{total}</StatIndicator>
        <StatIndicator label="Emails sent">{stats.sent}</StatIndicator>
        <StatIndicator label="Emails delivered">{stats.delivered}</StatIndicator>
      </dl>
      <div>
        <H2 className="mt-12">Select proposals to send acceptation emails</H2>
        <CampaignEmailFilters pathname={location.pathname} query={searchParams.get('query')} />
        <CampaignEmailList type={CampaignType.ACCEPTATION} proposals={results} total={total} />
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
