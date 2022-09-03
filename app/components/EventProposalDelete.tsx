import { Dialog } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Button } from '../design-system/Buttons';
import Modal from '~/design-system/dialogs/Modals';

export function EventProposalDeleteButton() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        Delete proposal
      </Button>
      <EventProposalDeleteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type DeleteProposalModalProps = { isOpen: boolean; onClose: () => void };

function EventProposalDeleteModal({ isOpen, onClose }: DeleteProposalModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Delete proposal
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete your proposal? The talk will still be in your profile, so you will be able
              to submit it again later.
            </p>
          </div>
        </div>
      </div>

      <Form
        action="edit"
        method="post"
        onSubmit={onClose}
        className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-end"
      >
        <input type="hidden" name="_method" value="DELETE" />
        <Button onClick={onClose} type="button" block variant="secondary" className="sm:w-auto ">
          Cancel
        </Button>
        <Button type="submit" block className="sm:w-auto">
          Delete proposal
        </Button>
      </Form>
    </Modal>
  );
}
