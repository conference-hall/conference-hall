import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { IconButton } from '~/design-system/IconButtons';
import { H2, Text } from '~/design-system/Typography';
import type { ConfirmationStatus, DeliberationStatus, PublicationStatus } from '~/types/proposals.types';

import { DeliberationModal } from './deliberation-modal';

const deliberationLabels = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

const publicationLabels = {
  NOT_PUBLISHED: 'Not published',
  PUBLISHED: 'Published',
};

const confirmationLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DECLINED: 'Declined',
};

type Props = {
  deliberationStatus: DeliberationStatus;
  publicationStatus: PublicationStatus;
  confirmationStatus: ConfirmationStatus;
};

export function DeliberationDetails({ deliberationStatus, publicationStatus, confirmationStatus }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <H2 size="s">Deliberation & publication</H2>
        <IconButton
          icon={Cog6ToothIcon}
          size="s"
          label="Change deliberation status"
          variant="secondary"
          onClick={() => setOpen(true)}
        />
        <DeliberationModal
          deliberationStatus={deliberationStatus}
          publicationStatus={publicationStatus}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
      <div className="flex justify-between gap-2">
        <Text weight="medium">Deliberation</Text>
        <Text variant="secondary">{deliberationLabels[deliberationStatus]}</Text>
      </div>
      {deliberationStatus !== 'PENDING' && (
        <div className="flex justify-between gap-2">
          <Text weight="medium">Publication</Text>
          <Text variant="secondary">{publicationLabels[publicationStatus]}</Text>
        </div>
      )}
      {confirmationStatus && (
        <div className="flex justify-between gap-2">
          <Text weight="medium">Speaker confirmation</Text>
          <Text variant="secondary">{confirmationLabels[confirmationStatus]}</Text>
        </div>
      )}
    </div>
  );
}
