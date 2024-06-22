import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { AlertInfo } from '~/design-system/Alerts.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { Modal } from '~/design-system/Modals.tsx';
import { Text } from '~/design-system/Typography.tsx';

const statuses = {
  ACCEPTED: { label: 'Accepted', icon: CheckIcon, color: 'text-green-600' },
  PENDING: { label: 'Pending', icon: QuestionMarkCircleIcon, color: 'text-gray-600' },
  REJECTED: { label: 'Rejected', icon: XMarkIcon, color: 'text-red-600' },
};

type Props = {
  status: keyof typeof statuses;
  selection: string[];
  isAllPagesSelected: boolean;
  totalSelected: number;
};

export function DeliberationButton({ status, selection, isAllPagesSelected, totalSelected }: Props) {
  const [open, setOpen] = useState(false);
  const { label, icon: Icon, color } = statuses[status];

  return (
    <>
      <Button variant="secondary" size="s" onClick={() => setOpen(true)}>
        <Icon className={cx('w-4 h-4', color)} aria-hidden />
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} size="l">
        <Modal.Content>
          <Form id="change-status" method="POST" onSubmit={() => setOpen(false)}>
            <Text size="base" weight="semibold" mb={4}>
              Are you sure you want to mark the {totalSelected} selected proposals as{' '}
              <span className={color}>{label}</span>?
            </Text>
            <AlertInfo>
              Be careful, if you change the status of published proposals, they will be unpublished. You will have to
              republish them to make them visible again to the speakers.
            </AlertInfo>
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="allPagesSelected" value={String(isAllPagesSelected)} />
            {selection.map((id) => (
              <input key={id} type="hidden" name="selection" value={id} />
            ))}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="change-status">
            {`Mark as ${label}`}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
