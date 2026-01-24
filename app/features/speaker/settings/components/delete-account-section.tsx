import { useTranslation } from 'react-i18next';
import { DeleteModalButton } from '~/design-system/dialogs/delete-modal.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

export function DeleteAccountSection() {
  const { t } = useTranslation();

  return (
    <Card as="section" className="flex flex-col gap-6 border-red-300 p-6 sm:flex-row sm:items-center lg:px-8">
      <div className="grow">
        <H2>{t('settings.account.danger.delete-account.heading')}</H2>
        <Subtitle>{t('settings.account.danger.delete-account.description')}</Subtitle>
      </div>
      <DeleteModalButton
        intent="delete-account"
        title={t('settings.account.danger.delete-account.button')}
        description={t('settings.account.danger.delete-account.modal.description')}
        confirmationText={t('settings.account.danger.delete-account.confirmation-text')}
        size="sm"
      />
    </Card>
  );
}
