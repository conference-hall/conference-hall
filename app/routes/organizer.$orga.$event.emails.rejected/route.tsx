import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ProposalsFilters } from '~/schemas/proposal';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CampaignEmailFilters } from '~/shared-components/events/campaign-email/CampaignEmailFilters';
import { CampaignEmailList, CampaignType } from '~/shared-components/events/campaign-email/CampaignEmailList';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import { ProposalSelectionSchema } from '~/schemas/proposal';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { createToast } from '~/libs/toasts/toasts';
import { CampaignEmailStats } from '~/shared-components/events/campaign-email/CampaignEmailStats';
import { searchProposals } from '~/routes/organizer.$orga.$event._index/server/search-proposals.server';
import { getRejectionCampaignStats } from './server/get-rejection-campaign-stats.server';
import { sendRejectionCampaign } from './server/send-rejection-campaign.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const { data } = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);
  const filters = {
    query: data?.query,
    emailRejectedStatus: data?.emailRejectedStatus || 'not-sent',
    status: ['REJECTED'],
  } as ProposalsFilters;

  try {
    const proposals = await searchProposals(params.orga, params.event, uid, filters, page);
    const stats = await getRejectionCampaignStats(params.orga, params.event, uid);
    return json({ proposals, stats });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const { data, error } = await withZod(ProposalSelectionSchema).validate(form);
  if (error) return json(null);
  await sendRejectionCampaign(params.orga, params.event, uid, data.selection);
  return json(null, await createToast(session, 'Emails successfully sent.'));
};

export default function RejectedProposalEmails() {
  const { proposals, stats } = useLoaderData<typeof loader>();
  const { results, pagination, statistics } = proposals;

  return (
    <>
      <H1>Rejection emails campaign</H1>
      <CampaignEmailStats stats={stats} />

      <div>
        <H2>Select proposals to send rejection emails</H2>

        <CampaignEmailFilters type={CampaignType.REJECTION} />

        <CampaignEmailList type={CampaignType.REJECTION} proposals={results} total={statistics.total} />

        <Pagination {...pagination} className="mt-8" />
      </div>
    </>
  );
}
