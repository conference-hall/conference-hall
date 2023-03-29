import type { LoaderArgs } from '@remix-run/node';
import type { OrganizerProposalContext } from '../organizer.$orga.$event.review.$proposal/route';
import { sessionRequired } from '~/libs/auth/auth.server';
import { useOutletContext } from '@remix-run/react';
import { Text } from '~/design-system/Typography';
import Badge from '~/design-system/Badges';
import { getLevel } from '~/utils/levels';
import { getLanguage } from '~/utils/languages';
import { IconLabel } from '~/design-system/IconLabel';
import { AcademicCapIcon, LanguageIcon } from '@heroicons/react/24/outline';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function OrganizerProposalContentRoute() {
  const { proposalReview } = useOutletContext<OrganizerProposalContext>();
  const { proposal } = proposalReview;

  return (
    <section className="space-y-8 overflow-auto p-8">
      <div>
        <div className="flex flex-wrap gap-8">
          {proposal.level && <IconLabel icon={AcademicCapIcon}>{getLevel(proposal.level)}</IconLabel>}
          {proposal.languages.length > 0 && (
            <IconLabel icon={LanguageIcon}>{proposal.languages.map(getLanguage).join(', ')}</IconLabel>
          )}
        </div>
        <Text>{proposal.abstract}</Text>
      </div>
      {proposal.formats.length > 0 && (
        <div>
          <Text size="s">Formats</Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {proposal.formats.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.categories.length > 0 && (
        <div>
          <Text size="s">Categories</Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {proposal.categories.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.references && (
        <div>
          <Text size="s">References</Text>
          <Text>{proposal.references}</Text>
        </div>
      )}
      {proposal.comments && (
        <div>
          <Text size="s">Message to organizers</Text>
          <Text>{proposal.comments}</Text>
        </div>
      )}
    </section>
  );
}
