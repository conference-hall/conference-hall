import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { List } from '~/design-system/list/List';

import { ReviewsProgress } from './reviews-progress';

type Props = {
  checkboxRef: React.RefObject<HTMLInputElement>;
  total: number;
  totalSelected: number;
  totalReviewed: number;
};

export function ListHeader({ checkboxRef, total, totalSelected, totalReviewed }: Props) {
  return (
    <List.Header>
      <div className="flex items-center gap-4">
        <Checkbox aria-label="Select current page" ref={checkboxRef}>
          {totalSelected === 0 ? `${total} proposals` : `${totalSelected} selected:`}
        </Checkbox>
        {totalSelected !== 0 && (
          <div className="space-x-2">
            <Button variant="secondary" size="s">
              <CheckIcon className="w-4 h-4 text-green-600" aria-hidden />
              Accept proposals
            </Button>
            <Button variant="secondary" size="s">
              <XMarkIcon className="w-4 h-4 text-red-600" aria-hidden />
              Reject proposals
            </Button>
          </div>
        )}
      </div>
      <ReviewsProgress reviewed={totalReviewed} total={total} />
    </List.Header>
  );
}
