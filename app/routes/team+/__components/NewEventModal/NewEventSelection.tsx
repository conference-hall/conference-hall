import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { MegaphoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { H1, Subtitle, Text } from '~/design-system/Typography.tsx';

type Props = {
  onSubmit: (type: 'MEETUP' | 'CONFERENCE') => void;
  onCancel: () => void;
};

export function NewEventSelection({ onSubmit, onCancel }: Props) {
  const [type, setType] = useState<'MEETUP' | 'CONFERENCE' | null>(null);

  return (
    <div className="flex flex-col gap-16">
      <div>
        <H1>Create a new event</H1>
        <Subtitle>Select the event type you want to create.</Subtitle>
      </div>

      <RadioGroup value={type} onChange={setType} aria-label="Select the event type">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <EventTypeOption
            value="CONFERENCE"
            label="Conference"
            description="With conference, the call for papers is open to proposals for a specific period."
            icon={MegaphoneIcon}
          />
          <EventTypeOption
            value="MEETUP"
            label="Meetup"
            description="With meetup, you can manually open or close the call for paper."
            icon={UserGroupIcon}
          />
        </div>
      </RadioGroup>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Go back
        </Button>
        <Button type="button" disabled={!type} onClick={() => (type ? onSubmit(type) : null)}>
          Continue
        </Button>
      </div>
    </div>
  );
}

type EventTypeOptionProps = {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

function EventTypeOption({ value, label, description, icon: Icon }: EventTypeOptionProps) {
  return (
    <RadioGroup.Option
      value={value}
      className={({ checked, active }) =>
        cx(
          checked ? 'border-transparent' : 'border-gray-300',
          active ? 'border-indigo-600 ring-2 ring-indigo-600' : '',
          'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
        )
      }
    >
      {({ checked, active }) => (
        <>
          <span className="flex flex-1">
            <span className="flex flex-col gap-2">
              <RadioGroup.Label as="div" className="flex items-center gap-2">
                <Icon className="h-6 w-6 text-indigo-600" />
                <Text strong>{label}</Text>
              </RadioGroup.Label>
              <RadioGroup.Description as="div">
                <Subtitle>{description}</Subtitle>
              </RadioGroup.Description>
            </span>
          </span>
          <CheckCircleIcon className={cx(!checked ? 'invisible' : '', 'h-5 w-5 text-indigo-600')} aria-hidden="true" />
          <span
            className={cx(
              active ? 'border' : 'border-2',
              checked ? 'border-indigo-600' : 'border-transparent',
              'pointer-events-none absolute -inset-px rounded-lg',
            )}
            aria-hidden="true"
          />
        </>
      )}
    </RadioGroup.Option>
  );
}
