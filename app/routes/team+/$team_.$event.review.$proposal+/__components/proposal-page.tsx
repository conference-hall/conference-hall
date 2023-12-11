import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link, useParams, useSearchParams } from '@remix-run/react';

import { AvatarName } from '~/design-system/Avatar.tsx';
import { Badge } from '~/design-system/Badges.tsx';
import { IconButtonLink } from '~/design-system/IconButtons';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H3, Text } from '~/design-system/Typography.tsx';
import { getLanguage } from '~/libs/formatters/languages';
import { getLevel } from '~/libs/formatters/levels';
import { useUser } from '~/root';

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
      {proposal.speakers.length > 0 && (
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 px-2 py-4 lg:px-6 border-b border-b-gray-200">
          {proposal.speakers.map((speaker) => (
            <Link
              key={speaker.name}
              to={`speakers/${speaker.id}?${search.toString()}`}
              className="flex items-end gap-1 hover:bg-gray-100 p-2 rounded-md"
            >
              <AvatarName
                key={speaker.name}
                name={speaker.name}
                picture={speaker.picture}
                subtitle={speaker.company}
                size="s"
              />
              <ChevronRightIcon className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      <Card.Content>
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            {proposal.level && <Badge color="indigo">{getLevel(proposal.level)}</Badge>}
            {proposal.languages.map((language) => (
              <Badge key={language}>{getLanguage(language)}</Badge>
            ))}
          </div>
          {canEditProposal && (
            <IconButtonLink
              icon={PencilSquareIcon}
              label="Edit proposal"
              variant="secondary"
              to={{ pathname: 'edit', search: search.toString() }}
            />
          )}
        </div>

        <div>
          <H3 srOnly>Abstract</H3>
          <Markdown>{proposal.abstract}</Markdown>
        </div>

        {hasFormats && (
          <div>
            <H3 mb={2}>Formats</H3>
            <Text>{proposal.formats?.map(({ name }) => name).join(', ') || '—'}</Text>
          </div>
        )}

        {hasCategories && (
          <div>
            <H3 mb={2}>Categories</H3>
            <Text>{proposal.categories?.map(({ name }) => name).join(', ') || '—'}</Text>
          </div>
        )}

        {proposal.references && (
          <div>
            <H3 mb={2}>References</H3>
            <Markdown>{proposal.references}</Markdown>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
