import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Text } from '~/design-system/typography.tsx';

const statuses = {
  ACCEPTED: { label: 'Accepted', icon: CheckIcon, color: 'text-green-600' },
  PENDING: { label: 'Not deliberated', icon: QuestionMarkCircleIcon, color: 'text-gray-600' },
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

  const Title = () => (
    <Text size="base" weight="semibold" mb={4}>
      Are you sure you want to mark the {totalSelected} selected proposals as <span className={color}>{label}</span>?
    </Text>
  );

  return (
    <>
      <Button variant="secondary" size="s" onClick={() => setOpen(true)}>
        <Icon className={cx('w-4 h-4', color)} aria-hidden />
        {label}
      </Button>
      <Modal title={<Title />} open={open} onClose={() => setOpen(false)}>
        <Modal.Content>
          <Form id="change-status" method="POST" onSubmit={() => setOpen(false)}>
            <Callout title="Be careful">
              If you change the status of published proposals, they will be unpublished. You will have to republish them
              to make them visible again to the speakers.
            </Callout>
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
