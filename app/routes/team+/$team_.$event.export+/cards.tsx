import './cards.css';

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';

import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { getLanguage } from '~/libs/formatters/languages.ts';
import { getLevel } from '~/libs/formatters/levels.ts';
import { formatReviewNote } from '~/libs/formatters/reviews.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);
  const results = await exports.forCards(filters);
  return json(results);
};

export default function ExportProposalsCards() {
  const results = useLoaderData<typeof loader>();

  return (
    <>
      <div className="layout">
        {results?.map((proposal) => (
          <div key={proposal.id} className="card">
            <div className="grow">
              <Text size="l" weight="medium" truncate>
                {proposal.title}
              </Text>
              <Subtitle truncate>{proposal.speakers?.join(', ')}</Subtitle>
            </div>
            <div>
              <div className="grid grid-cols-2 grid-rows-2 gap-2">
                <div className="rounded border border-gray-400 p-2">
                  <Subtitle truncate>{proposal.formats.map((f) => f.name).join(', ') || '-'}</Subtitle>
                </div>
                <div className="rounded border border-gray-400 p-2">
                  <Subtitle truncate>{proposal.categories.map((c) => c.name).join(', ') || '-'}</Subtitle>
                </div>
                <div className="rounded border border-gray-400 p-2">
                  <Subtitle truncate>{getLevel(proposal.level) || '-'}</Subtitle>
                </div>
                <div className="rounded border border-gray-400 p-2">
                  <Subtitle truncate>{proposal.languages.map(getLanguage).join(', ') || '-'}</Subtitle>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4">
                  <Text size="base">❤️ {proposal.reviews?.positives}</Text>
                  <Text size="base">💀 {proposal.reviews?.negatives}</Text>
                </div>
                <Text size="3xl" weight="medium">
                  {formatReviewNote(proposal.reviews?.average)}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
