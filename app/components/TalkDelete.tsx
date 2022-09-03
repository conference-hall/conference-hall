import { Dialog } from '@headlessui/react';
import { forwardRef, useState } from 'react';
import type { Ref } from 'react';
import { ExclamationCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import Modal from '~/design-system/dialogs/Modals';
import { Button } from '~/design-system/Buttons';

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
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Delete talk
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete your talk? It's a definitive action. You can't undo it.
            </p>
          </div>
        </div>
      </div>

      <Form method="post" onSubmit={onClose} className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-end">
        <input type="hidden" name="_action" value="delete-talk" />
        <Button onClick={onClose} type="button" block variant="secondary" className="sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" block className="sm:w-auto">
          Delete talk
        </Button>
      </Form>
    </Modal>
  );
}

export const TalkDeleteMenu = forwardRef(TalkDelete);
