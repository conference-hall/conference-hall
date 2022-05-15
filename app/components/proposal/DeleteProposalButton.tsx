import { Dialog } from '@headlessui/react';
import { ExclamationIcon, XIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Button } from '../Buttons';

export function DeleteProposalButton() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        Delete proposal
      </Button>
      <DeleteProposalModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type DeleteProposalModalProps = { isOpen: boolean; onClose: () => void };

function DeleteProposalModal({ isOpen, onClose }: DeleteProposalModalProps) {
  return (
    <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" open={isOpen} onClose={onClose}>
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                Delete proposal
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete your proposal? The talk will still be in your profile, so you will be{' '}
                  able to submit it again later.
                </p>
              </div>
            </div>
          </div>

          <Form action="edit" method="post" onSubmit={onClose} className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <input type="hidden" name="_method" value="DELETE" />
            <Button type="submit" block className="sm:ml-3 sm:w-auto">
              Delete proposal
            </Button>
            <Button onClick={onClose} type="button" block variant="secondary" className="mt-3 sm:mt-0 sm:w-auto ">
              Cancel
            </Button>
          </Form>
        </div>
      </div>
    </Dialog>
  );
}
