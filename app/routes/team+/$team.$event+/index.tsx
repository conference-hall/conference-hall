import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/.server/reviews/CfpReviewsSearch.ts';
import { Deliberate, DeliberateBulkSchema } from '~/.server/reviews/Deliberate.ts';
import { parseUrlPage } from '~/.server/shared/Pagination.ts';
import { parseUrlFilters } from '~/.server/shared/ProposalSearchBuilder.types.ts';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

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
  const result = parseWithZod(form, DeliberateBulkSchema);
  if (!result.success) return json(null);

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
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput />
            <div className="flex gap-2">
              <FiltersMenu />
              <SortMenu />
              <ExportMenu />
            </div>
          </div>
          <FiltersTags filters={filters} />
        </div>
        <ProposalsList proposals={results} pagination={pagination} statistics={statistics} />
      </div>
    </PageContent>
  );
}
