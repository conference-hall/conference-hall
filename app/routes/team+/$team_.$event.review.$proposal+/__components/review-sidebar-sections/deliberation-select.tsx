import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useSubmit } from '@remix-run/react';

import Select from '~/design-system/forms/Select';
import { H2 } from '~/design-system/Typography';
import type { DeliberationStatus } from '~/types/proposals.types';

type Props = { deliberationStatus: DeliberationStatus };

const statuses = {
  ACCEPTED: { name: 'Accepted', icon: CheckIcon, iconClassname: 'text-green-600' },
  REJECTED: { name: 'Rejected', icon: XMarkIcon, iconClassname: 'text-red-600' },
  PENDING: { name: 'Pending', icon: QuestionMarkCircleIcon, iconClassname: 'text-gray-600' },
};

export function DeliberationSelect({ deliberationStatus }: Props) {
  const submit = useSubmit();

  const handleSubmit = (name: string, value: string) => {
    submit({ intent: 'change-deliberation-status', status: value }, { method: 'POST' });
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <H2 size="s">Deliberation</H2>
      </div>
      <Select
        name="status"
        label="Change deliberation status"
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
