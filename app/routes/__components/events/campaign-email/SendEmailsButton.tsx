import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Form, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { Modal } from '~/design-system/Modals.tsx';

type SendEmailsButtonProps = { total: number; selection: string[]; onSend?: () => void };

export function SendEmailsButton({ total, selection, onSend }: SendEmailsButtonProps) {
  const { state } = useNavigation();
  const [isModalOpen, setModalOpen] = useState(false);
  const emailCount = selection.length > 0 ? selection.length : total;
  return (
    <>
      <Button onClick={() => setModalOpen(true)} size="s" loading={state === 'submitting' || state === 'loading'}>
        {selection.length > 0 ? `Send ${selection.length} emails` : 'Send all emails'}
      </Button>
      <SendEmailsModal
        title={`You are going to send ${emailCount} emails.`}
        selection={selection}
        isOpen={isModalOpen}
        onSend={onSend}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type ResendEmailButtonProps = { id: string; title: string };

export function ResendEmailButton({ id, title }: ResendEmailButtonProps) {
  const { state } = useNavigation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        variant="secondary"
        size="s"
        loading={state === 'submitting' || state === 'loading'}
      >
        Resend
      </Button>
      <SendEmailsModal
        title={`You are going to resend email for "${title}".`}
        selection={[id]}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type SendEmailsModalProps = {
  title: string;
  selection: string[];
  isOpen: boolean;
  onClose: () => void;
  onSend?: () => void;
};

function SendEmailsModal({ title, selection, isOpen, onClose, onSend }: SendEmailsModalProps) {
  const handleSubmit = () => {
    if (onSend) onSend();
    onClose();
  };
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={handleSubmit}>
        <Modal.Title title={title} icon={PaperAirplaneIcon} iconColor="info" />
        {selection.map((id) => (
          <input key={id} type="hidden" name="selection" value={id} />
        ))}
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Send</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
