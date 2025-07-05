import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';

export type DeleteModalButtonProps = {
  title: string;
  description: string;
  confirmationText: string;
  intent: string;
};

export function DeleteModalButton({ title, description, confirmationText, intent }: DeleteModalButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="submit" variant="important" iconLeft={TrashIcon} onClick={() => setOpen(true)}>
        {title}
      </Button>
      <DeleteModal
        title={title}
        description={description}
        confirmationText={confirmationText}
        intent={intent}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

type DeleteModalProps = {
  title: string;
  description: string;
  confirmationText: string;
  intent: string;
  open: boolean;
  onClose: VoidFunction;
};

function DeleteModal({ title, description, confirmationText, intent, open, onClose }: DeleteModalProps) {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState('');

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <Modal.Content className="space-y-4">
        <Callout variant="error">{description}</Callout>
        <Input
          label={t('common.confirmation-delete-input', { confirmationText })}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Form method="POST" preventScrollReset>
          <Button
            type="submit"
            variant="important"
            name="intent"
            value={intent}
            disabled={confirmation !== confirmationText}
            iconLeft={TrashIcon}
          >
            {title}
          </Button>
        </Form>
      </Modal.Actions>
    </Modal>
  );
}
