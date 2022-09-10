import c from 'classnames';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';
import { getLanguage } from '~/utils/languages';
import { getLevel } from '~/utils/levels';

type Props = {
  proposal: {
    abstract: string;
    references: string | null;
    level: string | null;
    comments: string | null;
    languages: string[];
  };
  className?: string;
};

export function ProposalPanel({ proposal, className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto p-8', className)}>
      <div>
        <Text className="text-sm font-semibold">Abstract</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          {proposal.level && <Badge>{getLevel(proposal.level)}</Badge>}
          {proposal.languages.map((language) => (
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
        </div>
        <Text className="mt-4">{proposal.abstract}</Text>
      </div>
      {proposal.references && (
        <div>
          <Text className="text-sm font-semibold">References</Text>
          <Text className="mt-4">{proposal.references}</Text>
        </div>
      )}
      {proposal.comments && (
        <div>
          <Text className="text-sm font-semibold">Message to organizers</Text>
          <Text className="mt-4">{proposal.comments}</Text>
        </div>
      )}
    </section>
  );
}
