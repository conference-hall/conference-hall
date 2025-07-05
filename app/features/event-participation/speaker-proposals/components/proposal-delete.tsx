import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Modal } from '~/shared/design-system/dialogs/modals.tsx';
import { Text } from '~/shared/design-system/typography.tsx';

type Props = { className?: string };

export function ProposalDeleteButton({ className }: Props) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)} className={className}>
        {t('event.proposal.delete.button')}
      </Button>
      <ProposalDeleteModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type DeleteProposalModalProps = { isOpen: boolean; onClose: VoidFunction };

function ProposalDeleteModal({ isOpen, onClose }: DeleteProposalModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={t('event.proposal.delete.modal.title')} open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Content>
          <Text>{t('event.proposal.delete.modal.description')}</Text>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button type="submit" name="intent" value="proposal-delete">
            {t('event.proposal.delete.button')}
          </Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
