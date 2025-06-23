import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid';
import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { TFunction } from 'i18next';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import Select from '~/design-system/forms/select.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { ConfirmationStatus, DeliberationStatus, PublicationStatus } from '~/types/proposals.types.ts';

type ProposalStatus = { deliberationStatus: DeliberationStatus; confirmationStatus: ConfirmationStatus };

type Props = ProposalStatus & { publicationStatus: PublicationStatus };

function mapStatusesToOptionValue(statuses: ProposalStatus) {
  if (statuses.confirmationStatus === 'PENDING') return 'NOT_ANSWERED';
  return statuses.confirmationStatus || statuses.deliberationStatus;
}

function mapOptionValueToStatuses(value: string) {
  switch (value) {
    case 'NOT_ANSWERED':
      return { deliberationStatus: '', confirmationStatus: 'PENDING' };
    case 'CONFIRMED':
      return { deliberationStatus: '', confirmationStatus: 'CONFIRMED' };
    case 'DECLINED':
      return { deliberationStatus: '', confirmationStatus: 'DECLINED' };
    case 'ACCEPTED':
      return { deliberationStatus: 'ACCEPTED', confirmationStatus: '' };
    case 'REJECTED':
      return { deliberationStatus: 'REJECTED', confirmationStatus: '' };
    default:
      return { deliberationStatus: 'PENDING', confirmationStatus: '' };
  }
}

function getOptions(t: TFunction, confirmationStatus: ConfirmationStatus) {
  return [
    {
      id: 'PENDING',
      name: t('common.proposals.status.pending'),
      icon: QuestionMarkCircleIcon,
      iconClassname: 'text-gray-600',
    },
    {
      id: 'ACCEPTED',
      name: t('common.proposals.status.accepted'),
      icon: CheckIcon,
      iconClassname: 'text-green-600',
      hidden: Boolean(confirmationStatus),
    },
    {
      id: 'REJECTED',
      name: t('common.proposals.status.rejected'),
      icon: XMarkIcon,
      iconClassname: 'text-red-600',
    },
    {
      id: 'NOT_ANSWERED',
      name: t('common.proposals.status.not-answered'),
      icon: ClockIcon,
      iconClassname: 'text-blue-600',
      hidden: !confirmationStatus,
    },
    {
      id: 'CONFIRMED',
      name: t('common.proposals.status.confirmed'),
      icon: CheckCircleIcon,
      iconClassname: 'text-green-600',
      hidden: !confirmationStatus,
    },
    {
      id: 'DECLINED',
      name: t('common.proposals.status.declined'),
      icon: XCircleIcon,
      iconClassname: 'text-red-600',
      hidden: !confirmationStatus,
    },
  ];
}

export function ProposalStatusSelect({ deliberationStatus, publicationStatus, confirmationStatus }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const proposalStatus = mapStatusesToOptionValue({ confirmationStatus, deliberationStatus });

  const canPublish = publicationStatus === 'NOT_PUBLISHED' && deliberationStatus !== 'PENDING';

  const handleSubmit = (_name: string, value: string) => {
    const confirmation = t('event-management.proposal-page.proposal-status.confirmation');

    const selectedStatus = mapOptionValueToStatuses(value);
    const mustPublishAgain = selectedStatus.deliberationStatus && publicationStatus === 'PUBLISHED';

    if (mustPublishAgain && !confirm(confirmation)) return;

    submit({ intent: 'change-proposal-status', ...selectedStatus }, { method: 'POST' });
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <H2 size="s">{t('common.proposal-status')}</H2>
      </div>

      <Select
        name="status"
        label={t('event-management.proposal-page.proposal-status.change')}
        value={proposalStatus}
        onChange={handleSubmit}
        options={getOptions(t, confirmationStatus)}
        srOnly
      />

      {canPublish ? <PublicationModal /> : null}
    </div>
  );
}

function PublicationModal() {
  const { t } = useTranslation();
  const formId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" block>
        {t('event-management.proposal-page.publication.submit')}
      </Button>

      <Modal title={t('event-management.proposal-page.publication.submit')} open={open} onClose={() => setOpen(false)}>
        <Modal.Content>
          <Form id={formId} method="POST" className="space-y-4">
            <Checkbox name="send-email" defaultChecked={true}>
              {t('event-management.proposal-page.publication.notify')}
            </Checkbox>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} name="intent" value="publish-results">
            {t('event-management.proposal-page.publication.submit')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
