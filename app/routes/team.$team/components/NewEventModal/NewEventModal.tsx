import { PlusIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons';
import { Modal } from '~/design-system/Modals';

import { NewEventForm } from './NewEventForm';
import { NewEventSelection } from './NewEventSelection';

type Props = { slug: string };

export function NewEventButton({ slug }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)} iconLeft={PlusIcon}>
        New event
      </Button>
      <NewEventModal slug={slug} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type NewEventModalProps = { slug: string; isOpen: boolean; onClose: () => void };

function NewEventModal({ slug, isOpen, onClose }: NewEventModalProps) {
  const [type, setType] = useState<'CONFERENCE' | 'MEETUP' | null>(null);

  return (
    <Modal open={isOpen} onClose={onClose} size="l">
      {!type ? (
        <NewEventSelection onSubmit={setType} onCancel={onClose} />
      ) : (
        <NewEventForm type={type} slug={slug} onCancel={() => setType(null)} />
      )}
    </Modal>
  );
}
