import { useState } from 'react';
import slugify from '@sindresorhus/slugify';
import { Input } from '~/design-system/forms/Input';
import EventVisibilityRadioGroup from './EventVisibilityRadioGroup';

type EventValues = {
  name: string;
  slug: string;
  visibility: 'PUBLIC' | 'PRIVATE';
};

type Props = {
  initialValues?: EventValues;
  errors?: { name?: string; slug?: string } | null;
};

export function EventInfoForm({ initialValues, errors }: Props) {
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
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        autoComplete="off"
        required
        error={errors?.slug}
      />
      <EventVisibilityRadioGroup defaultValue={initialValues?.visibility} />
    </>
  );
}
