import { Dialog } from '@headlessui/react';
import { LinkIcon, UserAddIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { Button } from '../../../components/Buttons';
import Modal from '../../../components/dialogs/Modals';
import { Text } from '../../../components/Typography';

type CoSpeakerDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function CoSpeakerDrawer({ open, onClose }: CoSpeakerDrawerProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
          <UserAddIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
            Add a co-speaker
          </Dialog.Title>
          <Text variant="secondary" className="mt-2">
            You can invite a co-speaker to join your talk by sharing an invitation link. Copy it and send it by email.
          </Text>
        </div>
      </div>
      <Button onClick={onClose} block className="mt-5 sm:mt-6 flex items-center">
        <LinkIcon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
        Copy invitation link
      </Button>
    </Modal>
  );
}

export function AddCoSpeakerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)} className="group flex items-center mt-4">
        <UserAddIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        Add a co-speaker
      </Button>
      <CoSpeakerDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AddCoSpeakerMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="group flex items-center px-4 py-2 text-sm">
        <UserAddIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        Add a co-speaker
      </button>
      <CoSpeakerDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
