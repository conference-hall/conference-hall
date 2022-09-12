import { useState } from 'react';
import c from 'classnames';
import slugify from '@sindresorhus/slugify';
import { Input } from '~/design-system/forms/Input';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { RadioGroup } from '@headlessui/react';

type Props = {
  type: 'MEETUP' | 'CONFERENCE';
  errors?: Record<string, string[]>;
};

export function EventInfoForm({ type, errors }: Props) {
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');

  return (
    <>
      <Input
        name="name"
        label="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(slugify(e.target.value.toLowerCase()));
        }}
        autoComplete="off"
        error={errors?.name?.[0]}
        required
      />
      <Input
        name="slug"
        label="Event URL"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        autoComplete="off"
        error={errors?.slug?.[0]}
        required
      />
      <Input name="address" label="Venue address or city" required autoComplete="off" error={errors?.address?.[0]} />
      {type === 'CONFERENCE' && (
        <div className="grid grid-cols-2 gap-6">
          <Input
            name="startDate"
            label="Start date"
            autoComplete="off"
            error={errors?.startDate?.[0]}
            className="col-span-2 sm:col-span-1"
          />
          <Input
            name="endDate"
            label="End date"
            autoComplete="off"
            error={errors?.startDate?.[0]}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}
      <MarkdownTextArea
        name="description"
        label="Description"
        required
        rows={5}
        autoComplete="off"
        error={errors?.description?.[0]}
      />
      <EventVisibilityRadioGroup />
    </>
  );
}

const settings = [
  { name: 'Private', value: 'PRIVATE', description: 'This event would be available to anyone who has the link.' },
  {
    name: 'Public',
    value: 'PUBLIC',
    description: 'This event will be available in the Conference Hall search and visible to anyone.',
  },
];

export default function EventVisibilityRadioGroup() {
  const [selected, setSelected] = useState('PRIVATE');

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
