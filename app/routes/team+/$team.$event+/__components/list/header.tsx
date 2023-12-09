import { Checkbox } from '~/design-system/forms/Checkboxes';
import { List } from '~/design-system/list/List';

import { ChangeStatus } from '../actions/change-status';
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
    <List.Header className="h-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center ">
        <Checkbox aria-label="Select current page" ref={checkboxRef}>
          {totalSelected === 0 ? `${total} proposals` : `Mark ${totalSelected} selected as:`}
        </Checkbox>
        {totalSelected !== 0 && (
          <div className="flex items-center gap-2">
            <ChangeStatus status="ACCEPTED" selection={selection} isAllPagesSelected={isAllPagesSelected} />
            <ChangeStatus status="PENDING" selection={selection} isAllPagesSelected={isAllPagesSelected} />
            <ChangeStatus status="REJECTED" selection={selection} isAllPagesSelected={isAllPagesSelected} />
          </div>
        )}
      </div>
      <ReviewsProgress reviewed={totalReviewed} total={total} />
    </List.Header>
  );
}
