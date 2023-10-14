import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { Modal } from '~/design-system/Modals.tsx';

type Props = { className?: string };

export function ProposalDeleteButton({ className }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)} className={className}>
        Delete proposal
      </Button>
      <ProposalDeleteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type DeleteProposalModalProps = { isOpen: boolean; onClose: () => void };

function ProposalDeleteModal({ isOpen, onClose }: DeleteProposalModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Title
          title="Are you sure you want to delete your proposal?"
          description="The talk will still be in your profile, so you will be able to submit it again later."
        />
        <input type="hidden" name="_action" value="delete" />
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Delete proposal</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
