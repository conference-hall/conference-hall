import { CheckIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { link } from '~/design-system/links.tsx';
import { Text } from '~/design-system/typography.tsx';

type PublicationProps = {
  type: 'ACCEPTED' | 'REJECTED';
  statistics: { notPublished: number; published: number };
};

export function PublicationButton({ type, statistics }: PublicationProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (statistics.published === 0 && statistics.notPublished === 0) {
    return <Text weight="medium">{t('event-management.publication.publish.nothing')}</Text>;
  }

  if (statistics.notPublished === 0) {
    return (
      <div className="flex items-center">
        <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
        <Text weight="medium">{t('event-management.publication.publish.published')}</Text>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cx(link(), 'text-sm font-medium')}>
        {type === 'ACCEPTED'
          ? t('event-management.publication.publish.publish-accepted')
          : t('event-management.publication.publish.publish-rejected')}{' '}
        &rarr;
      </button>

      <PublicationConfirmModal type={type} statistics={statistics} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type ModalProps = {
  open: boolean;
  onClose: VoidFunction;
} & PublicationProps;

function PublicationConfirmModal({ type, statistics, open, onClose }: ModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  const title =
    type === 'ACCEPTED'
      ? t('event-management.publication.publish.modal.title.accepted')
      : t('event-management.publication.publish.modal.title.rejected');

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <Modal.Content className="pt-6 space-y-4">
        <StatisticCard
          label={t('event-management.publication.publish.modal.to-publish')}
          stat={`${statistics.notPublished}`}
        />
        <Form id={formId} method="POST" onSubmit={onClose}>
          <ToggleGroup
            name="sendEmails"
            label={t('event-management.publication.publish.modal.email.label')}
            description={t('event-management.publication.publish.modal.email.description')}
            value={true}
          />
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={onClose} variant="secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" form={formId} name="type" value={type}>
          {t('event-management.publication.publish.modal.confirm')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
