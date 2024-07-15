import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';

import { Statistic } from './statistic.tsx';

type PublicationProps = {
  type: 'ACCEPTED' | 'REJECTED';
  statistics: { notPublished: number; published: number };
};

export function PublicationButton({ type, statistics }: PublicationProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="font-medium">
        Publish results &rarr;
      </Button>

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
        <dl className="flex items-center divide-x p-2 border border-gray-300 rounded">
          <Statistic
            name="total-annouce-published"
            label="Already published"
            className="basis-1/2"
            value={statistics?.published}
          />
          <Statistic
            name="total-annouce-to-publish"
            label="To publish"
            className="basis-1/2"
            value={statistics?.notPublished}
          />
        </dl>
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
