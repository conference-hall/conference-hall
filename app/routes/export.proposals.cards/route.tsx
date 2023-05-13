import type { LinksFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsExportFiltersSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/session';
import { exportProposals } from './server/export-proposals.server';
import { useLoaderData } from '@remix-run/react';

import styles from './styles.css';
import { Subtitle, Text } from '~/design-system/Typography';
import { getLanguage } from '~/utils/languages';
import { getLevel } from '~/utils/levels';
import { formatReviewNote } from '~/utils/reviews';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const url = new URL(request.url);

  const result = await withZod(ProposalsExportFiltersSchema).validate(url.searchParams);
  if (result.error) return json(null);

  const { team, event, ...filters } = result.data;
  const results = await exportProposals(event, userId, filters ?? {});
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
              <Text size="l" strong truncate>
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
                  <Text>❤️ {proposal.reviews?.positives}</Text>
                  <Text>💀 {proposal.reviews?.negatives}</Text>
                </div>
                <Text size="3xl" strong>
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
