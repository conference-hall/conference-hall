import { forwardRef, useState } from 'react';
import type { Ref } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { Modal } from '~/design-system/dialogs/Modals';
import { Button } from '~/design-system/Buttons';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function TalkDelete({ ...rest }, ref: Ref<HTMLButtonElement>) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <button
        ref={ref}
        {...rest}
        onClick={() => setModalOpen(true)}
        className="group flex w-full items-center px-4 py-2 text-sm"
      >
        <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        Delete
      </button>
      <TalkDeleteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type TalkDeleteModalProps = { isOpen: boolean; onClose: () => void };

function TalkDeleteModal({ isOpen, onClose }: TalkDeleteModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="post" onSubmit={onClose}>
        <Modal.Title
          title="Are you sure you want to delete your talk?"
          description="Be careful, it's a definitive action. You can't undo it."
          icon={ExclamationTriangleIcon}
          iconColor="danger"
        />
        <input type="hidden" name="_action" value="delete-talk" />
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Delete talk</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}

export const TalkDeleteMenu = forwardRef(TalkDelete);
