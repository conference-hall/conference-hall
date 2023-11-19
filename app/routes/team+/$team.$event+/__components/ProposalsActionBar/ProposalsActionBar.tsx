import { cx } from 'class-variance-authority';

import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';

import { ChangeStatusAction } from './actions/ChangeStatusActions.tsx';
import { ExportActions } from './actions/ExportActions.tsx';
import { SortActions } from './actions/SortActions.tsx';

type Props = {
  total: number;
  selection: string[];
  checked: boolean;
  onToggleAll: () => void;
  checkboxRef: React.RefObject<HTMLInputElement>;
};

export function ProposalsActionBar({ total, selection, checked, onToggleAll, checkboxRef }: Props) {
  const hasSelectedItems = selection.length > 0;

  return (
    <Card p={4} className="flex items-center justify-between">
      <Checkbox
        ref={checkboxRef}
        checked={checked}
        onChange={onToggleAll}
        className={cx('ml-2', { 'font-medium': hasSelectedItems })}
      >
        {hasSelectedItems ? `${selection.length} selected` : `${total} proposals`}
      </Checkbox>

      <div className="flex flex-row items-center gap-2">
        {hasSelectedItems ? (
          <ChangeStatusAction variant="secondary" size="s" selection={selection} />
        ) : (
          <>
            <ExportActions variant="secondary" size="s" />
            <SortActions variant="secondary" size="s" />
          </>
        )}
      </div>
    </Card>
  );
}