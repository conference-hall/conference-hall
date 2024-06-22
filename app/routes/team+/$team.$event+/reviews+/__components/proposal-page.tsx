import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from '@remix-run/react';

import { Badge } from '~/design-system/badges.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { getLanguage } from '~/libs/formatters/languages.ts';
import { getLevel } from '~/libs/formatters/levels.ts';
import { CoSpeakers } from '~/routes/__components/talks/co-speaker.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import type { ProposalData } from '../$proposal.index';

type Props = { proposal: ProposalData };

export function ProposalPage({ proposal }: Props) {
  const { user } = useUser();
  const params = useParams();
  const [search] = useSearchParams();

  const role = user?.teams.find((team) => team.slug === params.team)?.role;
  const canEditProposal = role !== 'REVIEWER';

  const hasFormats = proposal.formats && proposal.formats.length > 0;
  const hasCategories = proposal.categories && proposal.categories.length > 0;

  return (
    <Card as="section">
      <div className="flex justify-between items-center gap-4 px-6 py-3 border-b border-b-gray-200">
        <H1 size="base" weight="semibold" truncate>
          {proposal.title}
        </H1>
        {canEditProposal && (
          <IconLink
            icon={PencilSquareIcon}
            label="Edit proposal"
            variant="secondary"
            to={{ pathname: 'edit', search: search.toString() }}
          />
        )}
      </div>

      {proposal.speakers.length > 0 && (
        <CoSpeakers speakers={proposal.speakers} canEdit={false} className="pt-4 px-4" />
      )}

      <dl className="p-6 flex flex-col gap-6">
        <div>
          <dt className="sr-only">Abstract</dt>
          <Markdown as="dd" className="text-gray-700">
            {proposal.abstract}
          </Markdown>
        </div>

        {proposal.references && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">References</dt>
            <Markdown as="dd" className="text-gray-700">
              {proposal.references}
            </Markdown>
          </div>
        )}

        {hasFormats && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">Formats</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {proposal.formats?.map(({ id, name }) => <p key={id}>{name}</p>)}
            </dd>
          </div>
        )}

        {hasCategories && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">Categories</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {proposal.categories?.map(({ id, name }) => <p key={id}>{name}</p>)}
            </dd>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {proposal.level && <Badge color="indigo">{getLevel(proposal.level)}</Badge>}
          {proposal.languages.map((language) => (
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
        </div>
      </dl>
    </Card>
  );
}
