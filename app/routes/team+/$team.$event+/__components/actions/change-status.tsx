import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { Button } from '~/design-system/Buttons';

const statuses = {
  ACCEPTED: { label: 'Accepted', icon: CheckIcon, color: 'text-green-600' },
  PENDING: { label: 'Pending', icon: QuestionMarkCircleIcon, color: 'text-gray-600' },
  REJECTED: { label: 'Rejected', icon: XMarkIcon, color: 'text-red-600' },
};

type Props = {
  status: keyof typeof statuses;
  selection: string[];
  isAllPagesSelected: boolean;
};

export function ChangeStatus({ status, selection, isAllPagesSelected }: Props) {
  const { label, icon: Icon, color } = statuses[status];
  return (
    <Form method="POST">
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="allPagesSelected" value={String(isAllPagesSelected)} />
      {selection.map((id) => (
        <input key={id} type="hidden" name="selection" value={id} />
      ))}
      <Button variant="secondary" size="s">
        <Icon className={cx('w-4 h-4', color)} aria-hidden />
        {label}
      </Button>
    </Form>
  );
}
