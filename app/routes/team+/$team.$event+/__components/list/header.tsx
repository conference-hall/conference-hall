import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { List } from '~/design-system/list/List';

import { ReviewsProgress } from './reviews-progress';

type Props = {
  checkboxRef: React.RefObject<HTMLInputElement>;
  checked: boolean;
  toggle: () => void;
  total: number;
  totalSelected: number;
  totalReviewed: number;
};

export function ListHeader({ checkboxRef, checked, toggle, total, totalSelected, totalReviewed }: Props) {
  return (
    <List.Header>
      <div className="flex items-end gap-6">
        <Checkbox aria-label="Select current page" ref={checkboxRef} checked={checked} onChange={toggle}>
          {totalSelected === 0 ? `${total} proposals` : `${totalSelected} selected`}
        </Checkbox>
      </div>
      <div className="flex items-center gap-2">
        {totalSelected === 0 ? (
          <ReviewsProgress reviewed={totalReviewed} total={total} />
        ) : (
          <>
            <Button variant="secondary" size="s">
              <CheckIcon className="w-4 h-4 text-green-600" aria-hidden />
              Accept proposals
            </Button>
            <Button variant="secondary" size="s">
              <XMarkIcon className="w-4 h-4 text-red-600" aria-hidden />
              Reject proposals
            </Button>
          </>
        )}
      </div>
    </List.Header>
  );
}
