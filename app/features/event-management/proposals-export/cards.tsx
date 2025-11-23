import { useTranslation } from 'react-i18next';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getProtectedSession, protectedRouteMiddleware } from '~/shared/auth/auth.middleware.ts';
import { formatReviewNote } from '~/shared/formatters/reviews.ts';
import type { Route } from './+types/cards.ts';
import styles from './cards.css?url';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

export const middleware = [protectedRouteMiddleware];

export const links = () => [{ rel: 'stylesheet', href: styles }];

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);
  return exports.forCards(filters);
};

export default function ExportProposalsCards({ loaderData: results }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
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
              <div className="rounded-sm border border-gray-400 p-2">
                <Subtitle truncate>{proposal.formats.map((f) => f.name).join(', ') || '-'}</Subtitle>
              </div>
              <div className="rounded-sm border border-gray-400 p-2">
                <Subtitle truncate>{proposal.categories.map((c) => c.name).join(', ') || '-'}</Subtitle>
              </div>
              <div className="rounded-sm border border-gray-400 p-2">
                <Subtitle truncate>{proposal.level ? t(`common.level.${proposal.level}`) : '-'}</Subtitle>
              </div>
              <div className="rounded-sm border border-gray-400 p-2">
                <Subtitle truncate>
                  {proposal.languages.map((lang) => t(`common.languages.${lang}.label`)).join(', ') || '-'}
                </Subtitle>
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
  );
}
