import c from 'classnames';
import type { ProposalStatus } from '@prisma/client';
import { Text } from '~/design-system/Typography';
import { useProposalsSearchFilter } from '../../useProposalsSearchFilter';
import { ProposalStatusBadge } from '~/shared-components/proposals/ProposalStatusBadges';

type Props = {
  defaultValue?: ProposalStatus;
  statuses: Array<{ name: ProposalStatus; count: number }>;
};

export function StatusFilter({ defaultValue, statuses }: Props) {
  if (statuses.length === 0) return null;

  return (
    <div className="space-y-2 p-4">
      <Text size="s" variant="secondary" strong>
        Proposal statuses
      </Text>

      <div className="space-y-2">
        {statuses.map((status) => (
          <StatusFilterItem
            key={status.name}
            name={status.name}
            count={status.count}
            isSelected={status.name === defaultValue}
          />
        ))}
      </div>
    </div>
  );
}

type StatusFilterItemProps = {
  name: ProposalStatus;
  count: number;
  isSelected: boolean;
};

function StatusFilterItem({ name, count, isSelected }: StatusFilterItemProps) {
  const { addFilterFor } = useProposalsSearchFilter();

  const handleFilter = () => {
    isSelected ? addFilterFor('status', '') : addFilterFor('status', name);
  };

  return (
    <div className="flex items-center justify-between">
      <button onClick={handleFilter} className="flex items-center">
        <ProposalStatusBadge
          status={name}
          variant="label"
          className={c('hover:underline', { 'font-medium': isSelected })}
        />
      </button>
      <Text size="xs" variant="secondary" strong>
        {count}
      </Text>
    </div>
  );
}
