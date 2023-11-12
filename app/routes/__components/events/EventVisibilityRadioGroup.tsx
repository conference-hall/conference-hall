import { useState } from 'react';

import { RadioGroupList } from '~/design-system/forms/RadioGroupList.tsx';

const settings = [
  { title: 'Private', value: 'PRIVATE', description: 'This event would be available to anyone who has the link.' },
  {
    title: 'Public',
    value: 'PUBLIC',
    description: 'This event will be available in the Conference Hall search and visible to anyone.',
  },
];

export default function EventVisibilityRadioGroup({
  defaultValue = 'PRIVATE',
}: {
  defaultValue?: 'PUBLIC' | 'PRIVATE';
}) {
  const [selected, setSelected] = useState<string>(defaultValue);

  return (
    <RadioGroupList name="visibility" label="Visibility" value={selected} onChange={setSelected} options={settings} />
  );
}
