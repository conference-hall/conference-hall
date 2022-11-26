import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ProposalsFilters } from '~/schemas/proposal';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CampaignEmailFilters } from '~/components/campaign-email/CampaignEmailFilters';
import { CampaignEmailList, CampaignType } from '~/components/campaign-email/CampaignEmailList';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import { ProposalSelectionSchema } from '~/schemas/proposal';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { getRejectionCampaignStats, sendRejectionCampaign } from '~/services/organizers/emails-campaign.server';
import { createToast } from '~/utils/toasts';
import { CampaignEmailStats } from '~/components/campaign-email/CampaignEmailStats';
import { searchProposals } from '~/services/organizer-review/search-proposals.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const url = new URL(request.url);
  const { data } = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);
  const { slug, eventSlug } = params;
  const filters = {
    query: data?.query,
    emailRejectedStatus: data?.emailRejectedStatus || 'not-sent',
    status: ['REJECTED'],
  } as ProposalsFilters;

  try {
    const proposals = await searchProposals(slug!, eventSlug!, uid, filters, page);
    const stats = await getRejectionCampaignStats(slug!, eventSlug!, uid);
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
  await sendRejectionCampaign(slug!, eventSlug!, uid, data.selection);
  return json(null, await createToast(session, 'Emails successfully sent.'));
};

export default function RejectedProposalEmails() {
  const { proposals, stats } = useLoaderData<typeof loader>();
  const { results, pagination, total } = proposals;
  const location = useLocation();

  return (
    <>
      <H1>Rejection emails campaign</H1>
      <CampaignEmailStats stats={stats} />
      <div>
        <H2 className="mt-12">Select proposals to send rejection emails</H2>
        <CampaignEmailFilters type={CampaignType.REJECTION} />
        <CampaignEmailList type={CampaignType.REJECTION} proposals={results} total={total} />
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
