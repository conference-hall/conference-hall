import { BadgeDot } from '~/design-system/badges.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { ConfirmationStatus } from '~/types/proposals.types.ts';

type Props = { confirmationStatus: ConfirmationStatus };

export function ConfirmationDetails({ confirmationStatus }: Props) {
  if (!confirmationStatus) return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">Speakers confirmation</H2>
      <ConfirmationLabel confirmationStatus={confirmationStatus} />
    </div>
  );
}

function ConfirmationLabel({ confirmationStatus }: Props) {
  if (confirmationStatus === 'PENDING') {
    return <BadgeDot color="blue">Waiting for speakers confirmation</BadgeDot>;
  } else if (confirmationStatus === 'CONFIRMED') {
    return <BadgeDot color="green">Confirmed by speakers</BadgeDot>;
  } else if (confirmationStatus === 'DECLINED') {
    return <BadgeDot color="red">Declined by speakers</BadgeDot>;
  }
}
