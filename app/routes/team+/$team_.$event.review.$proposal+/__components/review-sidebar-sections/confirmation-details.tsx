import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

import { H2, Text } from '~/design-system/Typography';
import type { ConfirmationStatus } from '~/types/proposals.types';

type Props = { confirmationStatus: ConfirmationStatus };

export function ConfirmationDetails({ confirmationStatus }: Props) {
  if (!confirmationStatus) return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">Confirmation</H2>
      <ConfirmationLabel confirmationStatus={confirmationStatus} />
    </div>
  );
}

function ConfirmationLabel({ confirmationStatus }: Props) {
  if (confirmationStatus === 'PENDING') {
    return (
      <Text variant="secondary">
        <ClockIcon className="w-5 h-5 mr-2 mb-0.5 inline-block text-gray-600" />
        Waiting for speakers confirmation
      </Text>
    );
  } else if (confirmationStatus === 'CONFIRMED') {
    return (
      <Text variant="secondary">
        <CheckCircleIcon className="w-5 h-5 mr-2 mb-0.5 inline-block text-green-600" />
        Confirmed by speakers
      </Text>
    );
  } else if (confirmationStatus === 'DECLINED') {
    return (
      <Text variant="secondary">
        <XCircleIcon className="w-5 h-5 mr-2 mb-0.5 inline-block text-red-600" />
        Declined by speakers
      </Text>
    );
  }
}
