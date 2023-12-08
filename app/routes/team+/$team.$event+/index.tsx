import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { CfpReviewsSearch, ProposalsStatusUpdateSchema } from '~/domains/organizer-cfp-reviews/CfpReviewsSearch.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { parseUrlFilters } from '~/domains/shared/ProposalSearchBuilder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { ProposalsList } from './__components/proposals-list.tsx';
import { useTeamEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const results = await CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);
  return json(results);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalsStatusUpdateSchema });
  if (!result.value) return json(null);

  const search = CfpReviewsSearch.for(userId, params.team, params.event);
  const count = await search.changeStatus(result.value.selection, result.value.status);
  return toast('success', `${count} proposals marked as "${result.value.status.toLowerCase()}".`);
};

export default function EventReviewsRoute() {
  const { event } = useTeamEvent();
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  return (
    <PageContent>
      <h2 className="sr-only">Event proposals</h2>

      <ProposalsList
        proposals={results}
        filters={filters}
        pagination={pagination}
        statistics={statistics}
        formats={event.formats}
        categories={event.categories}
      />
    </PageContent>
  );
}
