import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useSubmit } from 'react-router';
import Select from '~/design-system/forms/select.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { DeliberationStatus, PublicationStatus } from '~/types/proposals.types.ts';

type Props = { deliberationStatus: DeliberationStatus; publicationStatus: PublicationStatus };

// todo(i18n): move to i18n
const statuses = {
  ACCEPTED: { name: 'Accepted', icon: CheckIcon, iconClassname: 'text-green-600' },
  REJECTED: { name: 'Rejected', icon: XMarkIcon, iconClassname: 'text-red-600' },
  PENDING: { name: 'Not deliberated', icon: QuestionMarkCircleIcon, iconClassname: 'text-gray-600' },
};

export function DeliberationSelect({ deliberationStatus, publicationStatus }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const handleSubmit = (_name: string, value: string) => {
    const confirmation = t('event-management.proposal-page.deliberate.confirmation');

    if (publicationStatus === 'PUBLISHED' && !confirm(confirmation)) return;
    submit({ intent: 'change-deliberation-status', status: value }, { method: 'POST' });
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <H2 size="s">{t('common.deliberation')}</H2>
      </div>
      <Select
        name="status"
        label={t('event-management.proposal-page.deliberate.change')}
        value={deliberationStatus}
        onChange={handleSubmit}
        options={Object.entries(statuses).map(([value, { name, icon, iconClassname }]) => ({
          id: value,
          name,
          icon,
          iconClassname,
        }))}
        srOnly
      />
    </div>
  );
}
