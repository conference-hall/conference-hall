import { Description, Field, Fieldset, Label, Legend, Radio, RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';

import type { EventType } from '~/types/events.types.ts';

const settings = [
  {
    name: 'Conference',
    value: 'CONFERENCE',
    description: 'With conference, the call for papers is open to proposals for a specific period.',
  },
  {
    name: 'Meetup',
    value: 'MEETUP',
    description: 'With meetup, you can manually open or close the call for paper.',
  },
];

type Props = { selected: EventType; onSelect: (type: EventType) => void };

export function EventTypeRadioGroup({ selected, onSelect }: Props) {
  return (
    <Fieldset>
      <Legend className="text-sm font-medium text-gray-900">Event type</Legend>

      <RadioGroup name="type" value={selected} onChange={onSelect}>
        <div className="mt-4 -space-y-px rounded-md bg-white">
          {settings.map((setting, settingIdx) => (
            <Field key={setting.name}>
              <Radio
                value={setting.value}
                className={({ checked }) =>
                  cx(
                    settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                    settingIdx === settings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                    checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                    'relative flex cursor-pointer border p-4 focus:outline-hidden',
                  )
                }
              >
                {({ focus, checked }) => (
                  <>
                    <span
                      className={cx(
                        checked ? 'border-transparent bg-indigo-600' : 'border-gray-300 bg-white',
                        focus ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                        'mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border',
                      )}
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <span className="ml-3 flex flex-col gap-2">
                      <Label className={cx(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}>
                        {setting.name}
                      </Label>
                      <Description className={cx(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}>
                        {setting.description}
                      </Description>
                    </span>
                  </>
                )}
              </Radio>
            </Field>
          ))}
        </div>
      </RadioGroup>
    </Fieldset>
  );
}
