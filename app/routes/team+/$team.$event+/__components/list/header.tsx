import { Checkbox } from '~/design-system/forms/Checkboxes';
import { List } from '~/design-system/list/List';

import { DeliberationButton } from '../actions/deliberation-button';
import { ReviewsProgress } from './reviews-progress';

type Props = {
  checkboxRef: React.RefObject<HTMLInputElement>;
  total: number;
  totalSelected: number;
  totalReviewed: number;
  selection: string[];
  isAllPagesSelected: boolean;
};

export function ListHeader({ checkboxRef, total, totalSelected, totalReviewed, selection, isAllPagesSelected }: Props) {
  return (
    <List.Header className="sm:h-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center ">
        <Checkbox aria-label="Select current page" ref={checkboxRef}>
          {totalSelected === 0 ? `${total} proposals` : `Mark ${totalSelected} selected as:`}
        </Checkbox>
        {totalSelected !== 0 && (
          <div className="flex items-center gap-2">
            <DeliberationButton
              status="ACCEPTED"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
            <DeliberationButton
              status="PENDING"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
            <DeliberationButton
              status="REJECTED"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
          </div>
        )}
      </div>
      <ReviewsProgress reviewed={totalReviewed} total={total} />
    </List.Header>
  );
}
