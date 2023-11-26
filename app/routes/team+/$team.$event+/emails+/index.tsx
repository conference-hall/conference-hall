import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Pagination } from '~/design-system/Pagination.tsx';
import { H1, H2 } from '~/design-system/Typography.tsx';
import { CfpReviewsSearch } from '~/domains/organizer-cfp-reviews/CfpReviewsSearch.ts';
import { parseUrlFilters } from '~/domains/organizer-cfp-reviews/proposal-search-builder/ProposalSearchBuilder.types.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { CampaignEmailFilters } from '~/routes/__components/events/campaign-email/CampaignEmailFilters.tsx';
import { CampaignEmailList, CampaignType } from '~/routes/__components/events/campaign-email/CampaignEmailList.tsx';
import { CampaignEmailStats } from '~/routes/__components/events/campaign-email/CampaignEmailStats.tsx';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';
import { ProposalSelectionSchema } from '~/routes/__types/proposal.ts';

import { getAcceptationCampaignStats } from './__server/get-acceptation-campaign-stats.server.ts';
import { sendAcceptationCampaign } from './__server/send-acceptation-campaign.server.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const proposalsFilters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const filters = {
    query: proposalsFilters.query,
    emailAcceptedStatus: proposalsFilters.emailAcceptedStatus || 'not-sent',
    status: ['ACCEPTED', 'CONFIRMED', 'DECLINED'],
  } as ProposalsFilters;

  const proposals = await CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);
  const stats = await getAcceptationCampaignStats(params.event, userId);
  return json({ proposals, stats });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const result = parse(form, { schema: ProposalSelectionSchema });
  if (!result.value) return json(null);
  await sendAcceptationCampaign(params.event, userId, result.value.selection);
  return toast('success', 'Emails successfully sent.');
};

export default function AcceptedProposalEmails() {
  const { proposals, stats } = useLoaderData<typeof loader>();
  const { results, pagination, statistics } = proposals;

  return (
    <>
      <H1>Acceptation emails campaign</H1>
      <CampaignEmailStats stats={stats} />

      <div>
        <H2>Select proposals to send acceptation emails</H2>

        <CampaignEmailFilters type={CampaignType.ACCEPTATION} />

        <CampaignEmailList type={CampaignType.ACCEPTATION} proposals={results} total={statistics.total} />

        <Pagination {...pagination} />
      </div>
    </>
  );
}
