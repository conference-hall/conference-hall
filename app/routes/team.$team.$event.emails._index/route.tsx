import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ProposalsFilters } from '~/schemas/proposal';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CampaignEmailFilters } from '~/shared-components/events/campaign-email/CampaignEmailFilters';
import { CampaignEmailList, CampaignType } from '~/shared-components/events/campaign-email/CampaignEmailList';
import { Pagination } from '~/design-system/Pagination';
import { H1, H2 } from '~/design-system/Typography';
import { parsePage } from '~/schemas/pagination';
import { ProposalSelectionSchema } from '~/schemas/proposal';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { CampaignEmailStats } from '~/shared-components/events/campaign-email/CampaignEmailStats';
import { searchProposals } from '~/routes/team.$team.$event._index/server/search-proposals.server';
import { sendAcceptationCampaign } from './server/send-acceptation-campaign.server';
import { getAcceptationCampaignStats } from './server/get-acceptation-campaign-stats.server';
import { parse } from '@conform-to/zod';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const result = ProposalsFiltersSchema.safeParse(url.searchParams);
  const page = await parsePage(url.searchParams);
  const currentFilters = result.success ? result.data : {};
  const filters = {
    query: currentFilters.query,
    emailAcceptedStatus: currentFilters.emailAcceptedStatus || 'not-sent',
    status: ['ACCEPTED', 'CONFIRMED', 'DECLINED'],
  } as ProposalsFilters;

  const proposals = await searchProposals(params.event, userId, filters, page);
  const stats = await getAcceptationCampaignStats(params.event, userId);
  return json({ proposals, stats });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const result = parse(form, { schema: ProposalSelectionSchema });
  if (!result.value) return json(null);
  await sendAcceptationCampaign(params.event, userId, result.value.selection);
  return json(null, await addToast(request, 'Emails successfully sent.'));
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

        <Pagination {...pagination} className="mt-8" />
      </div>
    </>
  );
}