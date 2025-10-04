import { useTranslation } from 'react-i18next';
import { href, useParams } from 'react-router';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { CopyInput } from '~/design-system/forms/copy-input.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useHydrated } from '~/design-system/utils/use-hydrated.ts';

type ShareProposalModalProps = { open: boolean; onClose: VoidFunction };

export function ShareProposalModal({ open, onClose }: ShareProposalModalProps) {
  const { t } = useTranslation();
  const params = useParams() as { team: string; event: string; proposal: string };

  const hydrated = useHydrated();
  if (!hydrated) return null;

  const { origin } = window.location;
  const organizerLink = new URL(href('/team/:team/:event/proposals/:proposal', params), origin).toString();
  const speakerLink = new URL(href('/:event/proposals/:proposal', params), origin).toString();

  return (
    <Modal title={t('event-management.proposal-page.share-modal.title')} open={open} size="l" onClose={onClose}>
      <Modal.Content className="space-y-6">
        <div>
          <Text weight="semibold">{t('event-management.proposal-page.share-modal.organizer-link-title')}</Text>
          <Text variant="secondary">{t('event-management.proposal-page.share-modal.organizer-link-description')}</Text>
          <CopyInput
            aria-label={t('event-management.proposal-page.share-modal.organizer-link-title')}
            value={organizerLink}
            className="mt-2"
            disabled
          />
        </div>

        <div>
          <Text weight="semibold">{t('event-management.proposal-page.share-modal.speaker-link-title')}</Text>
          <Text variant="secondary">{t('event-management.proposal-page.share-modal.speaker-link-description')}</Text>
          <CopyInput
            aria-label={t('event-management.proposal-page.share-modal.speaker-link-title')}
            value={speakerLink}
            className="mt-2"
            disabled
          />
        </div>
      </Modal.Content>
    </Modal>
  );
}
