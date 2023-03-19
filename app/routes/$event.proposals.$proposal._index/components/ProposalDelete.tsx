import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Modal } from '~/design-system/dialogs/Modals';

export function ProposalDeleteButton() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
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
      <Form action="edit" method="post" onSubmit={onClose}>
        <Modal.Title
          title="Are you sure you want to delete your proposal?"
          description="The talk will still be in your profile, so you will be able to submit it again later."
          icon={ExclamationTriangleIcon}
          iconColor="danger"
        />
        <input type="hidden" name="_method" value="DELETE" />
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
