import { Dialog } from '@headlessui/react';
import { ExclamationIcon, TrashIcon, XIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Button } from '../components-ui/Buttons';

export function TalkDeleteMenu() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="group flex w-full items-center px-4 py-2 text-sm"
      >
        <TrashIcon
          className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
        Delete
      </button>
      <TalkDeleteModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type TalkDeleteModalProps = { isOpen: boolean; onClose: () => void };

function TalkDeleteModal({ isOpen, onClose }: TalkDeleteModalProps) {
  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      open={isOpen}
      onClose={onClose}
    >
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Delete talk
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete your talk? It's a definitive
                  action. You can't undo it.
                </p>
              </div>
            </div>
          </div>

          <Form
            method="post"
            onSubmit={onClose}
            className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
          >
            <input type="hidden" name="_action" value="delete-talk" />
            <Button type="submit" block className="sm:ml-3 sm:w-auto">
              Delete talk
            </Button>
            <Button
              onClick={onClose}
              type="button"
              block
              variant="secondary"
              className="mt-3 sm:mt-0 sm:w-auto "
            >
              Cancel
            </Button>
          </Form>
        </div>
      </div>
    </Dialog>
  );
}
