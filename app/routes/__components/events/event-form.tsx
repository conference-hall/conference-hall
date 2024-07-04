import slugify from '@sindresorhus/slugify';
import { useState } from 'react';

import { Input } from '~/design-system/forms/input.tsx';

import { EventTimezoneInput } from './event-timezone.tsx';
import { EventVisibilityRadioGroup } from './event-visibility-radio-group.tsx';

type Props = {
  initialValues?: {
    name: string;
    slug: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    timezone: string;
  };
  errors?: Record<string, string | string[]> | null;
};

export function EventForm({ initialValues, errors }: Props) {
  const [name, setName] = useState<string>(initialValues?.name || '');
  const [slug, setSlug] = useState<string>(initialValues?.slug || '');

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
        required
        error={errors?.name}
      />
      <Input
        name="slug"
        label="Event URL"
        addon="https://conference-hall.io/"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        autoComplete="off"
        required
        error={errors?.slug}
      />
      <EventVisibilityRadioGroup defaultValue={initialValues?.visibility} />
      <EventTimezoneInput defaultValue={initialValues?.timezone} />
    </>
  );
}
