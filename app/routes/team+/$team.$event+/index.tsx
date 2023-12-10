import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { CfpReviewsSearch } from '~/domains/organizer-cfp-reviews/CfpReviewsSearch.ts';
import { Deliberate, DeliberateBulkSchema } from '~/domains/organizer-cfp-reviews/Deliberate.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { parseUrlFilters } from '~/domains/shared/ProposalSearchBuilder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { ExportMenu } from './__components/actions/export-menu.tsx';
import { FiltersMenu } from './__components/filters/filters-menu.tsx';
import { FiltersTags } from './__components/filters/filters-tags.tsx';
import { SearchInput } from './__components/filters/search-input.tsx';
import { SortMenu } from './__components/filters/sort-menu.tsx';
import { ProposalsList } from './__components/proposals-list.tsx';

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
  const result = parse(form, { schema: DeliberateBulkSchema });
  if (!result.value) return json(null);

  const { selection, status, allPagesSelected } = result.value;
  const deliberate = Deliberate.for(userId, params.team, params.event);

  let count = 0;
  if (allPagesSelected) {
    const filters = parseUrlFilters(request.url);
    count = await deliberate.markAll(filters, status);
  } else {
    count = await deliberate.mark(selection, status);
  }
  return toast('success', `${count} proposals marked as "${status.toLowerCase()}".`);
};

export default function ProposalReviewsRoute() {
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  return (
    <PageContent>
      <h2 className="sr-only">Event proposals</h2>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <SearchInput />
            <FiltersMenu />
            <SortMenu />
            <ExportMenu />
          </div>
          <FiltersTags filters={filters} />
        </div>
        <ProposalsList proposals={results} pagination={pagination} statistics={statistics} />
      </div>
    </PageContent>
  );
}
