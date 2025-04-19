import { useTranslation } from 'react-i18next';
import { BadgeDot } from '~/design-system/badges.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { ConfirmationStatus } from '~/types/proposals.types.ts';

type Props = { confirmationStatus: ConfirmationStatus };

export function ConfirmationDetails({ confirmationStatus }: Props) {
  const { t } = useTranslation();

  if (!confirmationStatus) return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">{t('event-management.proposal-page.confirmation.label')}</H2>
      <ConfirmationLabel confirmationStatus={confirmationStatus} />
    </div>
  );
}

function ConfirmationLabel({ confirmationStatus }: Props) {
  const { t } = useTranslation();

  if (confirmationStatus === 'PENDING') {
    return <BadgeDot color="blue">{t('common.proposals-status.waiting-confirmation')}</BadgeDot>;
  } else if (confirmationStatus === 'CONFIRMED') {
    return <BadgeDot color="green">{t('common.proposals-status.confirmed')}</BadgeDot>;
  } else if (confirmationStatus === 'DECLINED') {
    return <BadgeDot color="red">{t('common.proposals-status.declined')}</BadgeDot>;
  }
}
