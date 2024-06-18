import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link, useParams, useSearchParams } from '@remix-run/react';

import { Avatar } from '~/design-system/Avatar.tsx';
import { Badge } from '~/design-system/Badges.tsx';
import { IconLink } from '~/design-system/IconButtons';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H1, Text } from '~/design-system/Typography';
import { getLanguage } from '~/libs/formatters/languages';
import { getLevel } from '~/libs/formatters/levels';
import { useUser } from '~/routes/__components/useUser';

import type { ProposalData } from '../_layout';

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
        <ul aria-label="Speakers" className="flex flex-row gap-3 pt-4 px-4">
          {proposal.speakers.map((speaker) => (
            <li key={speaker.name}>
              <Link
                key={speaker.name}
                to={`speakers/${speaker.id}?${search.toString()}`}
                aria-label={`View ${speaker.name} profile`}
                className="flex items-center gap-2  hover:bg-gray-100 p-1 pr-3 rounded-full border border-gray-200"
              >
                <Avatar name={speaker.name} picture={speaker.picture} size="xs" />
                <Text weight="medium" size="xs" variant="secondary">
                  {speaker.name}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
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
