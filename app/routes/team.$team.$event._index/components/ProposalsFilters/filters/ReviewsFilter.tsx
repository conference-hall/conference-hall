import { Dotted } from '~/design-system/badges/Badges';
import { ProgressBar } from '~/design-system/ProgressBar';
import { Text } from '~/design-system/Typography';

import { useProposalsSearchFilter } from '../../useProposalsSearchFilter';

type Props = {
  defaultValue?: 'reviewed' | 'not-reviewed';
  reviewed: number;
  total: number;
};

export function ReviewsFilter({ defaultValue, reviewed, total }: Props) {
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Text variant="secondary" strong>
            Reviews
          </Text>
          <Text size="xs" variant="secondary" strong>{`${progress}%`}</Text>
        </div>
        <ProgressBar value={reviewed} max={total} />
      </div>

      {total > 0 && (
        <div className="space-y-2">
          <ReviewFilterItem
            name="reviewed"
            label="Reviewed"
            count={reviewed}
            isSelected={defaultValue === 'reviewed'}
            color="green"
          />
          <ReviewFilterItem
            name="not-reviewed"
            label="Not reviewed"
            count={total - reviewed}
            isSelected={defaultValue === 'not-reviewed'}
            color="red"
          />
        </div>
      )}
    </div>
  );
}

type ReviewFilterItemProps = {
  label: string;
  count: number;
  name: 'reviewed' | 'not-reviewed';
  isSelected: boolean;
  color: 'green' | 'red';
};

function ReviewFilterItem({ label, count, name, isSelected, color }: ReviewFilterItemProps) {
  const { addFilterFor } = useProposalsSearchFilter();

  if (count === 0) return null;

  const handleFilter = () => {
    isSelected ? addFilterFor('reviews', '') : addFilterFor('reviews', name);
  };

  return (
    <div className="flex items-center justify-between">
      <button onClick={handleFilter} className="flex items-center">
        <Dotted color={color} className="hover:underline">
          <Text as="span" size="xs" strong={isSelected}>
            {label}
          </Text>
        </Dotted>
      </button>
      <Text size="xs" variant="secondary" strong>
        {count}
      </Text>
    </div>
  );
}
