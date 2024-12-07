import { CheckIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { link } from '~/design-system/links.tsx';
import { Text } from '~/design-system/typography.tsx';

type PublicationProps = {
  type: 'ACCEPTED' | 'REJECTED';
  statistics: { notPublished: number; published: number };
};

export function PublicationButton({ type, statistics }: PublicationProps) {
  const [open, setOpen] = useState(false);

  if (statistics.published === 0 && statistics.notPublished === 0) {
    return <Text weight="medium">Nothing to publish yet</Text>;
  }

  if (statistics.notPublished === 0) {
    return (
      <div className="flex items-center">
        <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
        <Text weight="medium">Results published</Text>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cx(link(), 'text-sm font-medium')}>
        Publish all {type === 'ACCEPTED' ? '"Accepted"' : '"Rejected"'} &rarr;
      </button>

      <PublicationConfirmModal type={type} statistics={statistics} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
} & PublicationProps;

function PublicationConfirmModal({ type, statistics, open, onClose }: ModalProps) {
  const title = type === 'ACCEPTED' ? 'Accepted proposals publication' : 'Rejected proposals publication';

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <Modal.Content className="pt-6 space-y-4">
        <StatisticCard label="Results to publish" stat={`${statistics.notPublished}`} />
        <Form id="result-form" method="POST" onSubmit={onClose}>
          <ToggleGroup
            name="sendEmails"
            label="Send an email to notify speakers"
            description="The email will be sent to each proposal speaker"
            value={true}
          />
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" form="result-form" name="type" value={type}>
          Confirm results publication
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
