import { json2csv } from 'json-2-csv';
import type { LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';
import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';

import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import type { Languages } from '~/types/proposals.types.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);
  const results = await exports.forJson(filters);

  const csvContent = json2csv(
    results.map((result) => ({
      ...result,
      tags: result.tags.join(','),
      languages: (result.languages as Languages).join(','),
      formats: formatObjectArray(result.formats),
      categories: formatObjectArray(result.categories),
      speakers: formatObjectArray(result.speakers),
    })),
  );

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="conference-hall.csv"`,
    },
  });
};

const formatObjectArray = (objects?: Array<{ name: string }>): string => {
  return objects?.map((object) => object.name).join(',') ?? '';
};
