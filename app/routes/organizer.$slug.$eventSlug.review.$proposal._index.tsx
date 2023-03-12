import type { LoaderArgs } from '@remix-run/node';
import type { OrganizerProposalContext } from './organizer.$slug.$eventSlug.review.$proposal';
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
        <Text className="mt-8">{proposal.abstract}</Text>
      </div>
      {proposal.formats.length > 0 && (
        <div>
          <Text className="text-sm font-semibold">Formats</Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {proposal.formats.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.categories.length > 0 && (
        <div>
          <Text className="text-sm font-semibold">Categories</Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {proposal.categories.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.references && (
        <div>
          <Text className="text-sm font-semibold">References</Text>
          <Text className="mt-2">{proposal.references}</Text>
        </div>
      )}
      {proposal.comments && (
        <div>
          <Text className="text-sm font-semibold">Message to organizers</Text>
          <Text className="mt-2">{proposal.comments}</Text>
        </div>
      )}
    </section>
  );
}
