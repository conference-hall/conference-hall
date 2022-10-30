import { useState } from 'react';
import { Form, useTransition } from '@remix-run/react';
import { Modal } from '~/design-system/dialogs/Modals';
import { Button } from '~/design-system/Buttons';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

type SendEmailsButtonProps = { total: number; selection: string[] };

export function SendEmailsButton({ total, selection }: SendEmailsButtonProps) {
  const transition = useTransition();
  const [isModalOpen, setModalOpen] = useState(false);
  const emailCount = selection.length > 0 ? selection.length : total;
  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        size="s"
        loading={transition.state === 'submitting' || transition.state === 'loading'}
      >
        {selection.length > 0 ? `Send ${selection.length} emails` : 'Send all emails'}
      </Button>
      <SendEmailsModal
        title={`You are going to send ${emailCount} emails.`}
        selection={selection}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type ResendEmailButtonProps = { id: string; title: string };

export function ResendEmailButton({ id, title }: ResendEmailButtonProps) {
  const transition = useTransition();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        variant="secondary"
        size="s"
        loading={transition.state === 'submitting' || transition.state === 'loading'}
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
};

function SendEmailsModal({ title, selection, isOpen, onClose }: SendEmailsModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="post" onSubmit={onClose}>
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
