import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/.server/reviews/cfp-reviews-search.ts';
import { Deliberate, DeliberateBulkSchema } from '~/.server/reviews/deliberate.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { getObjectHash } from '~/libs/utils/object-hash.ts';

import { TagIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { ExportMenu } from './__components/proposals-list-page/actions/export-menu.tsx';
import { FiltersMenu } from './__components/proposals-list-page/filters/filters-menu.tsx';
import { FiltersTags } from './__components/proposals-list-page/filters/filters-tags.tsx';
import { SearchInput } from './__components/proposals-list-page/filters/search-input.tsx';
import { SortMenu } from './__components/proposals-list-page/filters/sort-menu.tsx';
import { ProposalsList } from './__components/proposals-list-page/proposals-list.tsx';

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
  const result = parseWithZod(form, { schema: DeliberateBulkSchema });
  if (result.status !== 'success') return json(null);

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

export default function ReviewsRoute() {
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  const filtersHash = getObjectHash(filters);

  return (
    <Page>
      <h2 className="sr-only">Event proposals</h2>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput />
            <div className="flex gap-2">
              <FiltersMenu />
              <SortMenu />
              <ButtonLink to="tags" variant="secondary" iconLeft={TagIcon}>
                Tags
              </ButtonLink>
              <ExportMenu />
            </div>
          </div>
          <FiltersTags filters={filters} />
        </div>

        <ProposalsList proposals={results} pagination={pagination} statistics={statistics} filtersHash={filtersHash} />
      </div>
    </Page>
  );
}
