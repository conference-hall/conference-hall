import { json2csv } from 'json-2-csv';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { Route } from './+types/csv.ts';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
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
      'Content-Disposition': `attachment; filename="${params.event}-proposals.csv"`,
    },
  });
};

const formatObjectArray = (objects?: Array<{ name: string }>): string => {
  return objects?.map((object) => object.name).join(',') ?? '';
};
