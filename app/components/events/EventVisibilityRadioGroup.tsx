import { RadioGroup } from '@headlessui/react';
import c from 'classnames';
import { useState } from 'react';

const settings = [
  { name: 'Private', value: 'PRIVATE', description: 'This event would be available to anyone who has the link.' },
  {
    name: 'Public',
    value: 'PUBLIC',
    description: 'This event will be available in the Conference Hall search and visible to anyone.',
  },
];

export default function EventVisibilityRadioGroup({
  defaultValue = 'PRIVATE',
}: {
  defaultValue?: 'PUBLIC' | 'PRIVATE';
}) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <RadioGroup name="visibility" value={selected} onChange={setSelected}>
      <RadioGroup.Label className="text-sm font-medium text-gray-900"> Visibility </RadioGroup.Label>
      <div className="mt-1 -space-y-px rounded-md bg-white">
        {settings.map((setting, settingIdx) => (
          <RadioGroup.Option
            key={setting.name}
            value={setting.value}
            className={({ checked }) =>
              c(
                settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                settingIdx === settings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                'relative flex cursor-pointer border p-4 focus:outline-none'
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className={c(
                    checked ? 'border-transparent bg-indigo-600' : 'border-gray-300 bg-white',
                    active ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                    'mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border'
                  )}
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="ml-3 flex flex-col">
                  <RadioGroup.Label
                    as="span"
                    className={c(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}
                  >
                    {setting.name}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="span"
                    className={c(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}
                  >
                    {setting.description}
                  </RadioGroup.Description>
                </span>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
