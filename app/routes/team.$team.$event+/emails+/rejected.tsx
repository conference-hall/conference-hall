import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Pagination } from '~/design-system/Pagination.tsx';
import { H1, H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { addToast } from '~/libs/toasts/toasts.ts';
import { CampaignEmailFilters } from '~/routes/__components/events/campaign-email/CampaignEmailFilters.tsx';
import { CampaignEmailList, CampaignType } from '~/routes/__components/events/campaign-email/CampaignEmailList.tsx';
import { CampaignEmailStats } from '~/routes/__components/events/campaign-email/CampaignEmailStats.tsx';
import { parsePage } from '~/routes/__types/pagination.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';
import { parseProposalsFilters, ProposalSelectionSchema } from '~/routes/__types/proposal.ts';
import { searchProposals } from '~/routes/team.$team.$event+/__server/search-proposals.server.ts';

import { getRejectionCampaignStats } from './__server/get-rejection-campaign-stats.server.ts';
import { sendRejectionCampaign } from './__server/send-rejection-campaign.server.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const proposalsFilters = parseProposalsFilters(url.searchParams);
  const page = parsePage(url.searchParams);
  const filters = {
    query: proposalsFilters.query,
    emailRejectedStatus: proposalsFilters.emailRejectedStatus || 'not-sent',
    status: ['REJECTED'],
  } as ProposalsFilters;

  const proposals = await searchProposals(params.event, userId, filters, page);
  const stats = await getRejectionCampaignStats(params.event, userId);
  return json({ proposals, stats });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalSelectionSchema });
  if (!result.value) return json(null);
  await sendRejectionCampaign(params.event, userId, result.value.selection);
  return json(null, await addToast(request, 'Emails successfully sent.'));
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

        <Pagination {...pagination} />
      </div>
    </>
  );
}